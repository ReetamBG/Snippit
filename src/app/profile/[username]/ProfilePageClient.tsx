"use client";

import {
  getProfileByUsername,
  getProfilePosts,
  updateProfile,
} from "@/actions/profile.actions";
import FollowButton from "@/components/FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignInButton, useUser } from "@clerk/nextjs";
import {
  Calendar,
  EditIcon,
  Heart,
  LinkIcon,
  LoaderCircle,
  MapPin,
  Notebook,
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import PostCard from "@/components/PostCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getProfilePosts>>;

type ProfilePageClientProps = {
  user: NonNullable<User>;
  posts: Posts;
  likedPosts: Posts;
  amIFollowing: boolean;
  myDbUserId: string;
};
const ProfilePageClient = ({
  user,
  posts,
  likedPosts,
  amIFollowing,
  myDbUserId,
}: ProfilePageClientProps) => {
  const { user: currentUser } = useUser();

  return (
    <div className="w-full px-3">
      <Card className="w-full p-5">
        <CardHeader>
          <div className="w-full flex flex-col sm:flex-row items-center gap-10">
            <Avatar className="h-25 w-25">
              <AvatarImage
                src={user.profilePicture || "/avatar.png"}
                alt="Avatar"
              />
              <AvatarFallback>Avatar</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-3">
              <CardTitle className="text-center sm:text-start">{user.name}</CardTitle>
              <CardDescription className="text-center sm:text-start">
                <p>@{user.username}</p>
                {user.bio && (
                  <>
                    {/* <Separator className="my-2" /> */}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {user.bio}
                    </p>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col gap-3 text-center p-0">
          <div className="flex justify-between">
            <div>
              <p>{user._count.posts}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div>
              <p>{user._count.followers}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div>
              <p>{user._count.following}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>

          {!currentUser ? ( // when not logged in follow will take to login
            <SignInButton>
              <Button>Follow</Button>
            </SignInButton>
          ) : user.clerkId !== currentUser.id ? (
            <FollowButton
              userId={user.id}
              amIFollowing={amIFollowing}
              className=""
            />
          ) : (
            <UpdateProfileDialog
              name={user.name || ""}
              bio={user.bio || ""}
              location={user.location || ""}
              website={user.website || ""}
            />
          )}

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
            <p className="flex gap-2 items-center py-1">
              <Calendar size={15} />
              <span>
                Joined {user.createdAt.getDay()}/{user.createdAt.getMonth()}/
                {user.createdAt.getFullYear()}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
      <Tabs defaultValue="posts" className="w-full mt-10">
        <TabsList className="w-full">
          <TabsTrigger value="posts">
            <Notebook />
            Posts
          </TabsTrigger>
          <TabsTrigger value="likes">
            <Heart />
            Likes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          {posts?.length === 0 ? (
            <div className="flex justify-center">
              No one liked your posts yet womp womp
            </div>
          ) : (
            posts?.map((post) => (
              <PostCard key={post.id} post={post} dbUserId={myDbUserId} />
            ))
          )}
        </TabsContent>
        <TabsContent value="likes">
          {likedPosts?.length === 0 ? (
            <div className="flex justify-center">No posts yet</div>
          ) : (
            likedPosts?.map((post) => (
              <PostCard key={post.id} post={post} dbUserId={myDbUserId} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

function UpdateProfileDialog({
  name,
  bio,
  location,
  website,
}: {
  name: string;
  bio: string;
  location: string;
  website: string;
}) {
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [formData, setFormData] = useState({
    name: name || "",
    bio: bio || "",
    location: location || "No Location",
    website: website || "No Website",
  });

  const handleSubmit = async () => {
    if (isUpdatingProfile) return;

    setIsUpdatingProfile(true);

    // creating formdata object
    const newFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      newFormData.append(key, value);
    });

    const res = await updateProfile(newFormData);
    if (res.success) toast.success("Profile updated");
    else toast.error("Could not update profile please try again later");

    setIsUpdatingProfile(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-left">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [e.target.id]: e.target.value,
                }))
              }
              className="col-span-3"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bio" className="text-left">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [e.target.id]: e.target.value,
                }))
              }
              className="col-span-3"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location" className="text-left">
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [e.target.id]: e.target.value,
                }))
              }
              className="col-span-3"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="website" className="text-left">
              Website
            </Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [e.target.id]: e.target.value,
                }))
              }
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isUpdatingProfile}
            type="submit"
            className="w-30"
          >
            {isUpdatingProfile ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProfilePageClient;
