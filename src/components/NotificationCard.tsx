// "use-client"  // needed so we can mark the notifications as read
// TODO: Implement this feature ... causing some problem

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Heart, UserPlus, MessageCircle, Dot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getAllNotifications } from "@/actions/notification.action";
import Link from "next/link";

type Notifications = Awaited<ReturnType<typeof getAllNotifications>>;
type Notification = Notifications[number];

const NotificationCard = ({ notification }: { notification: Notification }) => {
  return (
    <Card className="rounded-none">
      <CardContent className="flex flex-col gap-5">
        {/* HEADER (User info, creation time and delete) */}
        <div className="flex w-full justify-between">
          <Link href={`/profile/${notification.sender.username}`}>
            <div className="flex gap-3 items-center mr-5">
              <Avatar>
                <AvatarImage
                  src={notification.sender.profilePicture || "/avatar.png"}
                  alt="Avatar"
                />
              </Avatar>
              <div className="flex flex-col">
                <p className="font-semibold truncate text-sm">
                  {notification.sender.name}
                </p>
                <p className="text-sm text-muted-foreground ">
                  @{notification.sender.username}
                </p>
              </div>
            </div>
          </Link>
          <div className="relative flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </p>
            {/* {!notification.read && (
              <p className="absolute -right-4 top-2 text-sm text-muted-foreground">
                <Dot size={50} className="text-white" />
              </p>
            )} */}
          </div>
        </div>
        <div className="flex gap-2 ml-10">
          {notification.type === "LIKE" ? (
            <Heart size={18} className="text-red-600" />
          ) : notification.type === "COMMENT" ? (
            <MessageCircle size={18} className="text-blue-600" />
          ) : (
            <UserPlus size={18} className="text-green-600" />
          )}
          <p className="text-sm text-muted-foreground">
            {notification.type === "LIKE"
              ? "liked your post"
              : notification.type === "COMMENT"
              ? "commented on your post"
              : "started following you"}
          </p>
        </div>
        {/* POST CONTENT */}
        {notification.post && (
          <div className="ml-10 bg-card rounded-lg p-5">
            {notification.post.image && (
              <Image src={notification.post.image} alt="image" />
            )}
            {notification.post.content}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
