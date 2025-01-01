import express from "express";
import { createPost, postsLists } from "../controllers/postController";
import multer from "multer";
import authMiddleware from "../middleware/auth";

const postRouter = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/posts",
  filename: (_, file, callback) => {
    return callback(null, `${Date.now()}${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

postRouter.get("/postlist", postsLists);
postRouter.post("/upload", authMiddleware, upload.single("image"), createPost);

export default postRouter;
