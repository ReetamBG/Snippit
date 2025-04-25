import { getPosts } from "@/actions/post.action";
import PostCard from "@/components/PostCard";
import SuggestedUsersToFollow from "@/components/SuggestedUsersToFollow";

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

const Posts = ({
  dbUserId,
  posts,
}: {
  dbUserId: string | null;
  posts: Posts;
}) => {
  return (
    <div className="mt-5">
      {posts.map((post: Post, index: number) => (
        <>
          {index === 2 && <SuggestedUsersToFollow className="sm:hidden static my-10"/>}
          <PostCard key={post.id} post={post} dbUserId={dbUserId || ""} />
        </>
      ))}
    </div>
  );
};

export default Posts;
