"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "@/actions/user.action";
import { revalidatePath } from "next/cache";
import {cloudinary} from "@/lib/cloudinary";

export const createPost = async (content: string | null, image: string | null) => {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("Error fetching userId");

    let imageURL = null
    if (image) {
      const cloudinaryResponse = await cloudinary.uploader.upload(image);
      imageURL = cloudinaryResponse.secure_url;
    }

    await prisma.post.create({
      data: {
        authorId: userId,
        content: content,
        image: imageURL,
      },
    });

    revalidatePath("/"); // refresh cache to show changes
    return { success: true };
  } catch (error) {
    console.log(`Error in createPost server action: ${error}`);
    return { success: false };
  }
};

export const getPosts = async () => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" }, // latest post at top
      include: {
        // include the number of likes and comments
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        // include the author details
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true,
          },
        },
        // include likes
        likes: {
          select: {authorId: true}
        },
        // include the comments
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            // include author detail of comment
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                profilePicture: true,
              },
            },
          },
          orderBy: { createdAt: "asc" }, // oldest comment first
        },
      },
    });

    return posts;
  } catch (error) {
    console.log(`Error in getPosts server action: ${error}`);
    return [];
  }
};

export const toggleLike = async (postId: string) => {
  try {
    const myUserId = await getDbUserId();
    if (!myUserId) throw new Error("Could not fetch userId");

    // if post with postId does not exist
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!existingPost) throw new Error("Could not find post");

    // if already liked then dislike
    const existingLike = await prisma.like.findUnique({
      where: {
        authorId_postId: {
          authorId: myUserId,
          postId: postId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          authorId_postId: {
            authorId: myUserId,
            postId: postId,
          },
        },
      });

      revalidatePath("/");
      return { success: true };
    }

    // else create like and notification
    await prisma.$transaction([
      prisma.like.create({
        data: {
          authorId: myUserId,
          postId: postId,
        },
      }),
      // dont send notification if its our own post (come on be logical we are liking our own post)
      ...(existingPost.authorId !== myUserId
        ? [
            prisma.notification.create({
              data: {
                type: "LIKE",
                senderId: myUserId,
                receiverId: existingPost.authorId,
                postId: postId,
              },
            }),
          ]
        : []),
    ]);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.log(`Error in toggleLike server action: ${error}`);
    return { success: false, error: "Could not toggle like" };
  }
};

export const addComment = async (postId: string, content: string) => {
  try {
    const myUserId = await getDbUserId();
    if (!myUserId) throw new Error("Could not fetch userId");

    if (!content) throw new Error("Content is required");

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!existingPost) throw new Error("Post not found");

    await prisma.$transaction(async (tx) => {
      // create comment
      const newComment = await tx.comment.create({
        data: {
          postId: postId,
          authorId: myUserId,
          content: content,
        },
      });

      // dont send notification if we are the author of the post (same thing as in like)
      if (existingPost.authorId !== myUserId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            senderId: myUserId,
            receiverId: existingPost.authorId,
            postId: postId,
            commentId: newComment.id,
          },
        });
      }
    });

    revalidatePath("/")
    return { success: true };
  } catch (error) {
    console.log(`Error in addComment server action: ${error}`);
    return { success: false, error: "Could not add comment" };
  }
};

export const deletePost = async (postId: string) => {
  try {
    const myUserId = await getDbUserId();
    if (!myUserId) throw new Error("Could not fetch userId");

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if(!existingPost) throw new Error("Could not find post")
    
    if(existingPost.authorId !== myUserId) throw new Error("Not authorized to delete post")

    await prisma.post.delete({
      where: {id: postId}
    })
    
    revalidatePath("/")
    return {success: true}
  } catch (error) {
    console.log(`Error in deletePost server action: ${error}`);
    return { success: false, error: "Error deleting post" };
  }
};
