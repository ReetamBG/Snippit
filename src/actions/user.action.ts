"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// sync user in clerk to our db
export const syncUser = async () => {
  try {
    const authUser = await currentUser();
    if (!authUser) return;

    // if user already in db no need
    const existingUser = await prisma.user.findUnique({
      where: { email: authUser.emailAddresses[0].emailAddress },
    });

    if (existingUser) {
      revalidatePath("/");
      return existingUser;
    }

    // save data in db
    const dbUser = await prisma.user.create({
      data: {
        // check the clerk currentUser object it will make perfect sense
        // just using some custom logic to provide users with names and usernames if not provided
        clerkId: authUser.id,
        name: `${authUser.firstName || ""} ${authUser.lastName || ""}`,
        username:
          authUser.username ??
          authUser.emailAddresses[0].emailAddress.split("@")[0],
        email: authUser.emailAddresses[0].emailAddress,
        profilePicture: authUser.imageUrl,
      },
    });

    revalidatePath("/");
    return dbUser;
  } catch (error) {
    console.log(`Error in syncUser action: ${error}`);
  }
};

// fetch db user from clerk id (for left sidebar)
export const getUserByClerkId = async () => {
  try {
    const { userId } = await auth(); // clerk user id
    if (!userId) return;

    return await prisma.user.findUnique({
      where: { clerkId: userId },
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
  } catch (error) {
    console.log(`Error in fetchUserByClerkId: ${error}`);
  }
};

export const getDbUserId = async () => {
  try {
    const { userId } = await auth();
    if (!userId) return;  // returning null

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) throw new Error("User not found");

    return user.id;
  } catch (error) {
    console.log(`Error in fetchDbUserId: ${error}`);
  }
};

export const getRandomUsersToFollow = async (num_users: number) => {
  try {
    const myUserId = await getDbUserId();
    if (!myUserId) {
      console.log("Could not fetch user id");
      return [];
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          // get users other than me
          { NOT: { id: myUserId } },
          {
            // get users not followed by me
            NOT: {
              followers: {
                some: {
                  followerId: myUserId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        profilePicture: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: num_users,
    });

    return users;
  } catch (error) {
    console.log(`Error in getRandomUsersToFollow: ${error}`);
    return [];
  }
};

export const toggleFollow = async (targetUserId: string) => {
  try {
    const myUserId = await getDbUserId();
    if (!myUserId) {
      console.log("Could not fetch user id");
      return { success: false };
    }

    // if already followed then unfollow
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          // using the composite primary key thats why followerId_followingId
          followerId: myUserId,
          followingId: targetUserId,
        },
      },
    });
    if (existingFollow) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            // using the composite primary key thats why followerId_followingId
            followerId: myUserId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // if not following add follow and create follow notification
      await prisma.$transaction([
        prisma.follow.create({
          data: {
            followerId: myUserId,
            followingId: targetUserId,
          },
        }),
        prisma.notification.create({
          data: {
            type: "FOLLOW",
            receiverId: targetUserId,
            senderId: myUserId,
          },
        }),
      ]);
    }

    revalidatePath("/"); // refresh cache to show changes (on home page to remove followed users from suggested)
    return { success: true };
  } catch (error) {
    console.log(`Error in toggleFollow: ${error}`);
  }
};
