import CreatePosts from "@/components/CreatePosts";
import Posts from "@/components/Posts";
import SuggestedUsersToFollow from "@/components/SuggestedUsersToFollow";

import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
// import { ScrollArea } from "@/components/ui/scroll-area";

export default async function Home() {
  const dbUserId = await getDbUserId();
  const posts = await getPosts();

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-10 gap-5 px-3">
      <div className="sm:col-span-6 flex flex-col">
        {/* <ScrollArea className="h-[calc(100vh-7rem)] border-t rounded-md" scrollHideDelay={0}> */}
        <CreatePosts />
        {!dbUserId && <SignInForSmallScreens />}
        <Posts dbUserId={dbUserId || null} posts={posts} />
        {/* </ScrollArea> */}
      </div>
      <div className="hidden sm:block sm:col-span-4 px-3">
        <SuggestedUsersToFollow className="" />
      </div>
    </div>
  );
}

const SignInForSmallScreens = ()=>{
  return (
  <Card className="w-full mb-5 lg:hidden">
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
  )
}
