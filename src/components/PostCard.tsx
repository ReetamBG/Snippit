"use client";

import {
  addComment,
  deletePost,
  getPosts,
  toggleLike,
} from "@/actions/post.action";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, LoaderCircle, MessageCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cp } from "fs";
import Link from "next/link";

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

const PostCard = ({ post, dbUserId }: { post: Post; dbUserId: string }) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes);
  const [comment, setComment] = useState("");
  const [hasLiked, setHasLiked] = useState(
    post.likes.some((like) => like.authorId === dbUserId)
  );
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (isLiking) return; // prevents repeated request on multiple clicks while backend is processing

    setIsLiking(true);
    setHasLiked((prev) => !prev);
    setOptimisticLikes((prev) => (hasLiked ? prev - 1 : prev + 1));

    const res = await toggleLike(post.id);
    if (!res.success) {
      // restore previous values if fail
      setOptimisticLikes(post._count.likes);
      setHasLiked(post.likes.some((like) => like.authorId === dbUserId));
    }

    setIsLiking(false);
  };

  const handleDelete = async () => {
    if (isDeleting) return; // prevents repeated request on multiple clicks while backend is processing

    setIsDeleting(true);
    const res = await deletePost(post.id);
    if (res.success) toast.success("Post deleted");
    else toast.error("Could not delete post");

    setIsDeleting(false);
  };

  const handleComment = async () => {
    if (isCommenting || !comment.trim()) return; // prevents repeated request on multiple clicks while backend is processing

    setIsCommenting(true);
    const res = await addComment(post.id, comment);
    if (res.success) {
      toast.success("Comment added");
      setComment("");
    } else toast.error("Could not add comment");

    setIsCommenting(false);
  };

  return (
    <Card className="rounded-none">
      <CardContent className="flex flex-col gap-5">
        {/* HEADER (User info, creation time and delete) */}
        <div className="flex w-full justify-between">
          <Link href={`/profile/${post.author.username}`}>
            <div className="flex gap-3 items-center">
              <Avatar>
                <AvatarImage
                  src={post.author.profilePicture || "/avatar.png"}
                  alt="Avatar"
                />
              </Avatar>
              <div className="flex flex-col">
                <p className="font-semibold truncate">{post.author.name}</p>
                <p className="text-sm text-muted-foreground ">
                  @{post.author.username}
                </p>
              </div>
            </div>
          </Link>
          <div className="flex gap-2">
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </p>
            {post.authorId === dbUserId && (
              <DeleteAlertPopup
                handlerFunction={handleDelete}
                postId={post.id}
                isDeleting={isDeleting}
              />
            )}
          </div>
        </div>
        {/* POST CONTENT */}
        <div className="bg-card p-5 rounded-md">
          {post.image && <Image src={post.image} alt="image" />}
          {post.content}
        </div>
        {/* LIKE AND COMMENT BUTTON */}
        <div className="flex gap-5">
          <Button
            onClick={handleLike}
            variant="ghost"
            size="sm"
            className="flex gap-2"
          >
            <Heart className={hasLiked ? "text-red-500 fill-current" : ""} />
            {optimisticLikes}
          </Button>
          <Button
            onClick={() => {
              setShowComments((prev) => !prev);
            }}
            variant="ghost"
            size="sm"
            className="flex gap-2"
          >
            <MessageCircle
              className={showComments ? "text-blue-500 fill-current" : ""}
            />
            {post._count.comments}
          </Button>
        </div>
        <AnimatePresence initial={false}>
          {showComments && (
            <motion.div
              key="comments"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* COMMENTS */}
              <div className="flex flex-col gap-3">
                <Separator />
                <Textarea
                  onChange={(e) => setComment(e.target.value)}
                  value={comment}
                  placeholder="Write a comment..."
                />
                <div className="flex justify-end">
                  <Button
                    disabled={!comment.trim()}
                    onClick={handleComment}
                    size="sm"
                    className="w-25"
                  >
                    {isCommenting ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      "Comment"
                    )}
                  </Button>
                </div>
                {post.comments.length !== 0 && (
                  <div>
                    <Separator />
                    <p className="mb-5 font-semibold">Comments</p>
                    <div className="flex flex-col gap-3">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex flex-col gap-2">
                          <div className="flex w-full justify-between">
                            <Link href={`/profile/${comment.author.username}`}>
                              <div className="flex gap-3 items-center">
                                <Avatar>
                                  <AvatarImage
                                    src={
                                      comment.author.profilePicture ||
                                      "/avatar.png"
                                    }
                                    alt="Avatar"
                                  />
                                </Avatar>
                                <div className="flex flex-col">
                                  <p className="text-sm truncate">
                                    {comment.author.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground ">
                                    @{comment.author.username}
                                  </p>
                                </div>
                              </div>
                            </Link>
                            <div className="flex gap-2 items-center">
                              <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(comment.createdAt),
                                  { addSuffix: true }
                                )}
                              </p>
                            </div>
                          </div>
                          <p className="ml-12">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

const DeleteAlertPopup = ({ handlerFunction, postId, isDeleting }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="size-5 hover:text-red-600">
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handlerFunction(postId)}>
            {isDeleting ? <LoaderCircle className="animate-spin" /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PostCard;
