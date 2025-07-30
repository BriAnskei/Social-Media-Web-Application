import { Request, response, Response } from "express";
import postModel, { IPost } from "../models/postModel";
import mongoose, { isObjectIdOrHexString } from "mongoose";
import { postRequestHanlder, postService } from "../services/post.service";
import { likeQueue } from "../queues/post/likeQueue";
import { commentQueue } from "../queues/post/commentQueue";
import { getQueueEvents } from "../queues/events/getQueueEvents";
import { uploadQueue } from "../queues/post/uploadQueue";

import { ObjectId } from "mongodb";
import { errorLog } from "../services/errHandler";

export interface ExtentRequest extends Request {
  userId?: string;
}
export const createPost = async (
  req: ExtentRequest,
  res: Response
): Promise<void> => {
  try {
    const postPayload = postRequestHanlder.getCreatePostPayload(req);

    const job = await uploadQueue.add(
      "uploadPost",
      postPayload,
      getErrDelayjson()
    );

    const jobResponse = await job.waitUntilFinished(
      getQueueEvents("uploadQueue")
    );

    res.json(jobResponse);
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export const updatePost = async (req: Request, res: Response): Promise<any> => {
  try {
    const { postId } = req.params;
    const newImageFile = req.file;
    const { deletedImage, deletedContent, content } = req.body;

    const postData = await postModel.findById(postId);

    if (!postData) {
      return res.json({ success: false, message: "Post Data does not exist" });
    }

    if (newImageFile || postData?.image) {
      if (deletedImage === "true") {
        postData.image = newImageFile ? newImageFile.filename : "";
      } else {
        if (newImageFile) {
          postData.image = newImageFile.filename;
        }
      }
    }

    postData.content =
      deletedContent && deletedContent === "true"
        ? content
        : content || postData.content;

    await postData.save();

    res.json({
      success: true,
      posts: postData,
      message: "post successfully updated",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export const postsLists = async (_: Request, res: Response): Promise<void> => {
  try {
    const posts = postService.fetchAllPost();
    res.json({ success: true, message: "message fetche", posts });
  } catch (error) {
    errorLog("postsLists", error as Error);
    res.json({ success: false, message: "Error" });
  }
};

export const likeToggled = async (req: ExtentRequest, res: Response) => {
  try {
    await likeQueue.add(
      "postliked",
      { postId: req.body.postId, userId: req.userId },
      {
        attempts: 3, // retry 3 timnes it fails
        backoff: {
          // if the job fails and needs to retry
          type: "exponential", // delay before each retry increases exponentially.
          delay: 2000, // initial delay between retries is 2000ms (2 seconds).s
        },
        removeOnComplete: 100, // Keep only last 100 completed jobs
        removeOnFail: 50, // keep erros jobs
      }
    );
    res.json({ success: true, message: "post liked" });
  } catch (error) {
    console.log("failed on likeToggled, ", error);
    res.json({ success: false, message: "Error" });
  }
};

export const addComment = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.body.postId || !req.body.data) {
      return res.json({ success: false, message: "Invalid data" });
    }

    await commentQueue.add(
      "commentPost",
      {
        postId: req.body.postId,
        comment: req.body.data,
      },
      {
        // Maximum number of retry attempts if the job fails
        attempts: 3,

        // Configuration for how to delay retries between attempts
        backoff: {
          // Use exponential backoff strategy (e.g., 200ms, 400ms, 800ms, etc.)
          type: "exponential",

          // Base delay in milliseconds before retrying a failed job
          delay: 200,
        },

        // Automatically remove the job from the queue after completion,
        // but keep the last 100 completed jobs in history (for logging/debugging)
        removeOnComplete: 100,

        // Automatically remove failed jobs from the queue,
        // but keep the last 50 failed jobs in history (for logging/debugging)
        removeOnFail: 50,
      }
    );

    res.json({
      success: true,
      message: "Comment successfully adddeddd",
    });
  } catch (error) {
    console.log("Failed on addComment", error);
    res.json({ success: false, message: "Error" });
  }
};

export const findPostById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { postId } = req.body;

    if (!postId) throw new Error("Invvalid no Id recieved");

    const postData = await postModel.findById(postId);

    if (!postData) {
      return res.json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, posts: postData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<any> => {
  try {
    const { postId } = req.body;

    if (!postId) {
      return res.json({
        success: false,
        message: "Post Id is required to delete a post",
      });
    }

    const result = await postModel.deleteOne({ _id: postId });

    res.json({
      success: true,
      message: `SuccesFully deleted; acknowledge: ${result.acknowledged}, deletedCount: ${result.deletedCount}`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
