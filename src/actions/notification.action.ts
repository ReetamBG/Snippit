"use serv";

import { getDbUserId } from "@/actions/user.action";
import prisma from "@/lib/prisma";

export const getAllNotifications = async () => {
  try {
    const myUserId = await getDbUserId();
    if (!myUserId) {
      console.log("Could not fetch userId in getAllNotifications");
      return { success: false, error: "Could not fetch userId" };
    }

    const notifications = await prisma.notification.findMany({
      where: { receiverId: myUserId },
      select: {
        id: true,
        type: true,
        read: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            image: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {success: true, notifications};
  } catch (error) {
    console.log(`Error in getAllNotifications server action: ${error}`);
    return { success: false, error: "Could not fetch notifications" };
  }
};

export const markNotificationsAsRead = async (notificationIds: string[]) => {
  try {
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.log(`Error in markNotificationsAsRead server action: ${error}`);
    return { success: false, error: "Could not update read status" };
  }
};
