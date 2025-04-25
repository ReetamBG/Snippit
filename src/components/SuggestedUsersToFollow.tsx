import { getRandomUsersToFollow } from "@/actions/user.action";
import FollowButton from "@/components/FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Link from "next/link";

const SuggestedUsersToFollow = async ({className}: {className: string}) => {
  const suggestedUsers = await getRandomUsersToFollow(3);
  console.log(suggestedUsers)
  if (suggestedUsers.length === 0) return null;

  return (
    <Card className={`sticky top-25 ${className}`}>
      <CardHeader>
        <CardTitle>Try Following</CardTitle>
      </CardHeader>
      <CardContent>
        {suggestedUsers.map((user) => (
          <div className="flex justify-between mb-5" key={user.id}>
            <Link href={`/profile/${user.username}`}>
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user.profilePicture || "/avatar.png"}
                  alt="Avatar"
                />
                <AvatarFallback>Avatar</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p>{user.name}</p>
                <p className="text-muted-foreground text-sm">
                  @{user.username}
                </p>
                <p className="text-muted-foreground text-sm">{user._count.followers} followers</p>
              </div>
            </div>
              </Link>
            <FollowButton userId={user.id} amIFollowing={false} className="w-20"/>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SuggestedUsersToFollow;


