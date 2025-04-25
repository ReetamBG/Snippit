"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Image as ImageIcon, LoaderCircle, Send } from "lucide-react";
import toast from "react-hot-toast";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createPost } from "@/actions/post.action";

const CreatePosts = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [isPosting, setisPosting] = useState(false);

  const { user } = useUser();
  if (!user) return null;

  const handleSubmit = async () => {
    setisPosting(true);
    const res = await createPost(content, image);
    if (res.success) {
      toast.success("Post created successfully");
      setContent("");
      setImage("");
    } else {
      toast.error("Error creating post");
    }
    setisPosting(false);
  };

  return (
    <div className="">
      <Card >
        <CardContent>
          <div className="flex gap-5">
            <Avatar>
              <AvatarImage src={user.imageUrl} alt="Avatar" />
              <AvatarFallback>Avatar</AvatarFallback>
            </Avatar>
            <Textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
              }}
              className="h-30"
              placeholder="Whats on your mind today?"
            />
          </div>
          <Separator className="my-5" />
          <div className="flex justify-between">
            <Button variant="ghost" className="flex gap-3" disabled={isPosting}>
              <ImageIcon /> <p className="text-muted-foreground">Photo</p>
              {/* will handle this later */}
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex gap-3"
              disabled={(!content.trim() && !image) || isPosting}
            >
              {isPosting ? <LoaderCircle className="animate-spin" /> : <Send />}
              <p>{isPosting ? "Posting..." : "Post"}</p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePosts;
