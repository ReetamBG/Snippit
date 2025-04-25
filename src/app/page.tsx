import CreatePosts from "@/components/CreatePosts";
import Posts from "@/components/Posts";
import SuggestedUsersToFollow from "@/components/SuggestedUsersToFollow";

import { getPosts } from "@/actions/post.action"
import { getDbUserId } from "@/actions/user.action"
// import { ScrollArea } from "@/components/ui/scroll-area";

export default async function Home() {
  const dbUserId = await getDbUserId()
  const posts = await getPosts()
  
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-10 gap-5 px-3">
      <div className="sm:col-span-6 flex flex-col">
      {/* <ScrollArea className="h-[calc(100vh-7rem)] border-t rounded-md" scrollHideDelay={0}> */}
        <CreatePosts />
        <Posts dbUserId={dbUserId || null} posts={posts}/>
      {/* </ScrollArea> */}
      </div>
      <div className="hidden sm:block sm:col-span-4 px-3">
        <SuggestedUsersToFollow />
      </div>
    </div>
  );
}
