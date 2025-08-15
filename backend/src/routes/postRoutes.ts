import express from "express";
import {
  addComment,
  createPost,
  deletePost,
  findPostById,
  likeToggled,
  getPosts,
  updatePost,
  getPostByUserId,
} from "../controllers/postController";
import upload from "../middleware/upload";
import authMiddleware from "../middleware/auth";

const postRouter = express.Router();

postRouter.get("/postlist", getPosts);
postRouter.post(
  "/upload",
  authMiddleware,
  upload.post.save.single("image"),
  createPost
);
postRouter.post(
  "/update/:postId",
  authMiddleware,
  upload.post.updateImage.single("image"),
  updatePost
);
postRouter.post("/like-toggle", authMiddleware, likeToggled);
postRouter.post("/getpost", findPostById);
postRouter.get(
  "/delete",
  authMiddleware,
  upload.post.delete.single(),
  deletePost
);
postRouter.get("/user/:userId", getPostByUserId);

export default postRouter;
