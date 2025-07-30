import { Request, Response } from "express";
import { errorLog } from "../services/errHandler";
import CommentModel from "../models/commentModel";
import { commentQueue } from "../queues/post/commentQueue";
import { getQueueEvents } from "../queues/events/getQueueEvents";
import { notificationQueue } from "../queues/notification/notificationQueue";
import { generateCommentPayload } from "../services/comment.service";

export const getComments = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const cursor = req.body.cursor;

    res.json({ succes: true, message: "comment added to queue" });
  } catch (error) {
    errorLog("addComment", error as Error);
  }
};
