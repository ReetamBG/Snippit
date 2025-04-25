import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { getUserByClerkId } from "@/actions/user.action";
import { Link as LinkIcon, MapPin } from "lucide-react";
import Link from "next/link";

// type User = Awaited<ReturnType<typeof currentUser>>

const Sidebar = async () => {
  const authUser = await currentUser(); // clerk user
  if (!authUser) return <UnAuthenticatedSidebar />;

  const user = await getUserByClerkId(); // fetch db user from clerk id
  if(!user) return null 
  
  return <AuthenticatedSidebar user={user}/>;
};

const AuthenticatedSidebar = ({ user }) => {
  return (
      <Card className="w-full p-5 sticky top-25">
        <CardHeader>
          <Link href={`/profile/${user.username}`}>
            <div className="w-full flex flex-col items-center gap-3">
              <Avatar className="h-25 w-25">
                <AvatarImage src={user.profilePicture || "/avatar.png"} alt="@shadcn" />
                <AvatarFallback>Avatar</AvatarFallback>
              </Avatar>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription className="text-center">
                <p>@{user.username}</p>
                {user.bio && (
                  <>
                    {/* <Separator className="my-2" /> */}
                    <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>
                  </>
                )}
              </CardDescription>
            </div>
          </Link>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col gap-3 text-center p-0">
          <div className="flex justify-between">
            <div>
              <p>{user._count.followers}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div>
              <p>{user._count.following}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>
          {/* <div>
            Posts: {user._count.posts}
          </div> */}
          <Separator />
          <div className="text-sm text-start text-muted-foreground">
            <p className="flex gap-2 items-center py-1">
              <MapPin size={15} />
              {user.location ?? "No location"}
            </p>
            <Link href={user.website || "/"} target="_blank">
            <p className="flex gap-2 items-center py-1">
              <LinkIcon size={15} />
              {user.website ?? "No website"}
            </p>
            </Link>
          </div>
        </CardContent>
      </Card>
  );
};

const UnAuthenticatedSidebar = () => {
  return (
      <Card className="w-full sticky top-30">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Login to access your account and follow others.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <SignInButton mode="modal">
            <Button variant={"outline"}>Login</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button>Signup</Button>
          </SignUpButton>
        </CardContent>
      </Card>
  );
};

export default Sidebar;
