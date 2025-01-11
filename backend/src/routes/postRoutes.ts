import express from "express";
import { createPost, postsLists } from "../controllers/postController";
import upload from "../middleware/upload";
import authMiddleware from "../middleware/auth";

const postRouter = express.Router();

postRouter.get("/postlist", postsLists);
postRouter.post(
  "/upload",
  authMiddleware,
  upload.post.single("image"),
  createPost
);

export default postRouter;
