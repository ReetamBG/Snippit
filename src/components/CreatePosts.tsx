"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Image as ImageIcon, LoaderCircle, Send, X } from "lucide-react";
import toast from "react-hot-toast";

import { useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createPost } from "@/actions/post.action";
import { reduceImageSize } from "@/lib/utils";

const CreatePosts = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [isPosting, setisPosting] = useState(false);
  // const [showImageUpload, setShowImageUpload] = useState(false);

  const imageInputRef = useRef(null);

  const { user } = useUser();
  if (!user) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader(); // create the reader
    reader.readAsDataURL(file); // convert to Base64 string
    reader.onload = async () => {
      const compressedImage = await reduceImageSize(reader.result, 300)
      setImage(compressedImage as string);
    };
  };

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
      <Card>
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
          {image && (
            <div className="relative ml-12 mt-5">
              <button
                onClick={() => {
                  setImage(null);
                }}
                className="absolute left-30 -top-2 rounded-full bg-base-300 cursor-pointer"
              >
                <X size={20} />
              </button>
              <img
                src={image}
                className="w-30 m-2 rounded-lg object-cover"
              />
            </div>
          )}
          <Separator className="my-5" />
          <div className="flex justify-between">
            <input
              ref={imageInputRef}
              onChange={handleImageChange}
              type="file"
              accept="image/*"
              className="hidden"
            />
            <Button
              onClick={()=> {imageInputRef.current.click()}}
              variant="ghost"
              className="flex gap-3"
              disabled={isPosting}
            >
              <ImageIcon /> <p className="text-muted-foreground">Photo</p>
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
