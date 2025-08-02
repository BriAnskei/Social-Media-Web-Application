import express from "express";
import { getComments } from "../controllers/commentController";
import authMiddleware from "../middleware/auth";

const commentRouter = express.Router();

commentRouter.get("/get/:postId", authMiddleware, getComments);

export default commentRouter;
