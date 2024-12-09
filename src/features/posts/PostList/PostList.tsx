import { useEffect, useState } from "react";

import "./PostList.css";
import Post from "../Post/Post";

export interface PostProp {
  _id: string;
  user: string;
  content: string;
  image?: string;
  likes: string[];
  comments: {
    user: string;
    content: string;
    createdAt: string;
  }[];
  createdAt: string;
}

const PostList = () => {
  const [post, setPost] = useState<PostProp[]>([]);
  useEffect(() => {
    const examplePost: PostProp[] = [
      {
        _id: "post1",
        user: "user1",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        image:
          "https://www.autodeal.com.ph/custom/car-model-photo/original/mitsubishi-xforce-primary-6685042dec84e.jpg",
        likes: ["user2", "user3"],
        comments: [
          {
            user: "user2",
            content: "Great post!",
            createdAt: "2023-11-23T12:34:56Z",
          },
        ],
        createdAt: "2023-11-22T10:00:00Z",
      },
      {
        _id: "post2",
        user: "user3",
        content: "This is toshe second post.",
        likes: ["user1"],
        comments: [
          {
            user: "user1",
            content: "Nice one!",
            createdAt: "2023-11-23T13:00:00Z",
          },
          {
            user: "user2",
            content: "I agree.",
            createdAt: "2023-11-23T13:30:00Z",
          },
        ],
        createdAt: "2023-11-22T11:00:00Z",
      },
    ];

    setPost(examplePost);
  }, []);

  return (
    <>
      <div className="postlist-container">
        {post.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </div>
    </>
  );
};

export default PostList;
