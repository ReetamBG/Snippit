import {
  getProfileByUsername,
  getProfilePosts,
  getLikedPosts,
  getIsFollowing,
} from "@/actions/profile.actions";
import ProfilePageClient from "./ProfilePageClient";
import { getDbUserId } from "@/actions/user.action";
import { notFound } from "next/navigation";

type Params = Promise<{ username: string }>;

const ProfilePageServer = async ({ params }: { params: Params }) => {
  const { username } = await params;
  const user = await getProfileByUsername(username);
  if(!user) notFound()

  const [posts, likedPosts, amIFollowing, myDbUserId] = await Promise.all([
    getProfilePosts(user.id),
    getLikedPosts(user.id),
    getIsFollowing(user.id),
    getDbUserId(),
  ]);

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      amIFollowing={amIFollowing}
      myDbUserId={myDbUserId || ""}
    />
    // using server comp to fetch stuff and client comp for interactivity
  );
};

export default ProfilePageServer;
