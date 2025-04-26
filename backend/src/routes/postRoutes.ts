import express from "express";
import {
  addComment,
  createPost,
  deletePost,
  findPostById,
  likeToggled,
  postsLists,
  updatePost,
} from "../controllers/postController";
import upload from "../middleware/upload";
import authMiddleware from "../middleware/auth";

const postRouter = express.Router();

postRouter.get("/postlist", postsLists);
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
postRouter.post("/add-comment", addComment);
postRouter.post("/getpost", findPostById);
postRouter.post(
  "/delete",
  authMiddleware,
  upload.post.delete.single(),
  deletePost
);
// search

export default postRouter;
