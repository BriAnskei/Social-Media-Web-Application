import axios from "axios";

import { posts } from "../assets/assets";

const API_BASE_URL = "https://your-api-url.com/api";



export const fetchPost = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const Posts = posts.map((posts) => ({
    ...posts, createdAt: posts.createdAt.toISOString(),
   comments: posts.comments.map((comment) => ({
    ...comment, createdAt: comment.createdAt.toISOString()
   }))

  }))

  return Posts;
};
