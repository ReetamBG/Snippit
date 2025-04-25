import { getAllNotifications } from "@/actions/notification.action";
import { getUserByClerkId } from "@/actions/user.action";
import NotificationCard from "@/components/NotificationCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

const NotificationsPage = async () => {
  const res = await getAllNotifications();
  if (!res.success) return null;

  const notifications = res.notifications;

  return (
    <div className="w-full grid grid-cols-1 gap-5 px-3">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="w-full p-0">
          <ScrollArea>
            <div className="px-0 h-[calc(100vh-14rem)]">
              {notifications.map((notification) => (
                <div key={notification.id}>
                  <NotificationCard notification={notification}/>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
