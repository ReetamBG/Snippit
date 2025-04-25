"use server"

import { getDbUserId } from "@/actions/user.action";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const getProfileByUsername = async (username: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.log(`Error in getProfileByUsername server action: ${error}`);
  }
};

export const getProfilePosts = async (userId: string) => {
  // copied it from getPosts() from post.actions
  try {
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true,
          },
        },
        likes: {
          select: { authorId: true },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                profilePicture: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return posts;
  } catch (error) {
    console.log(`Error in getProfilePosts server action: ${error}`);
  }
};

// gets the user(not necessarily me) posts that are liked by others 
export const getLikedPosts = async (userId: string) => {
  try {
    const posts = await prisma.post.findMany({
      where: { likes: { some: { authorId: userId } } },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true,
          },
        },
        likes: {
          select: { authorId: true },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                profilePicture: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return posts;
  } catch (error) {
    console.log(`Error in getProfilePosts server action: ${error}`);
  }
};

export const updateProfile = async (formData: FormData) => {
  try {
    // check if authenticated user
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Could not fetch clerkId");

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;

    const updatedUser = await prisma.user.update({
      where: { clerkId: clerkId },
      data: {
        name,
        bio,
        location,
        website,
      },
    });

    revalidatePath("/profile")  // anything like "/profile/rest-of-the-url" all will be revalidated starting from "/profile"
    return { success: true, user: updatedUser };
  } catch (error) {
    console.log(`Error in updateProfile server action: ${error}`);
    return { success: false, error: "Error updating form data" };
  }
};

export const getIsFollowing = async (userId: string) => {
  try {
    const myUserId = await getDbUserId();
    if (!myUserId) throw new Error("Could not fetch userId");

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: myUserId,
          followingId: userId
        }
      }
    })

    return !!follow  // returns true if it returns an object, returns false if follow is null
  } catch (error) {
    console.log(`Error in getIsFollowing server action: ${error}`);
    return false
  }
};
