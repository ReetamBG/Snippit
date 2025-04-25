"use client";

import { toggleFollow } from "@/actions/user.action";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const FollowButton = ({ userId, className, amIFollowing }: { userId: string, className: string | null, amIFollowing: boolean }) => {
  const [isFollowed, setIsFollowed] = useState(amIFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    const res = await toggleFollow(userId);

    if (res?.success) {
      setIsFollowed(!isFollowed);
      toast.success("User followed");
    } else {
      toast.error("Some error occured");
    }
    
    setIsLoading(false)
  };

  return (
    <Button
      onClick={handleClick}
      variant={`${isFollowed ? "secondary" : "default"}`}
      size="lg"
      className={className || ""}
    >
      {isLoading ? <LoaderCircle className="animate-spin"/> : (isFollowed ? "Unfollow" : "Follow")}
    </Button>
  );
};

export default FollowButton;
