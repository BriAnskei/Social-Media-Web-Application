import express from "express";
import { createPost } from "../controllers/postController";
import multer from "multer";
import authMiddleware from "../middleware/auth";

const postRouter = express.Router();

const storage = multer.diskStorage({
  destination: "uploades/posts",
  filename: (req, file, callback) => {
    return callback(null, `${Date.now()}${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

postRouter.post("/upload", authMiddleware, upload.single("image"), createPost);

export default postRouter;
