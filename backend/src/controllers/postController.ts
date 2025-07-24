import { Request, Response } from "express";
import postModel from "../models/postModel";
import mongoose from "mongoose";
import { postRequestHanlder } from "../services/post.service";
import { likeQueue } from "../queues/post/likeQueue";
import { commentQueue } from "../queues/post/commentQueue";
import { getQueueEvents } from "../queues/events/getQueueEvents";
import { uploadQueue } from "../queues/post/uploadQueue";

export interface ExtentRequest extends Request {
  userId?: string;
}
export const createPost = async (
  req: ExtentRequest,
  res: Response
): Promise<void> => {
  try {
    const postPayload = postRequestHanlder.getCreatePostPayload(req);

    const job = await uploadQueue.add("uploadPost", postPayload, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 200,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    });

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
    const posts = await postModel.aggregate([
      {
        // Add computed fields to each post document
        $addFields: {
          // Add a boolean field `hasMoreComments` to indicate if the post has more than 15 comments
          hasMoreComments: { $gt: [{ $size: "$comments" }, 15] },
          // Limit the `comments` array to the first 15 elements (pagination preview)
          comments: { $slice: ["$comments", 15] },
        },
      },
      {
        // Sort posts by `createdAt` field in descending order (newest posts first)
        $sort: { createdAt: -1 },
      },
      {
        // Lookup the user data for the `user` field (reference to Users collection)
        $lookup: {
          from: "users", // Target collection to join from
          localField: "user", // Field in post document (a user ObjectId)
          foreignField: "_id", // Field in users collection to match
          as: "user", // Result will be stored as an array in this field
        },
      },
      {
        // Since the user lookup returns an array, we convert it to an object (assumes only 1 user per post)
        $unwind: "$user",
      },
      {
        // Lookup user information for each commenter in the `comments.user` field
        $lookup: {
          from: "users", // Target users collection
          localField: "comments.user", // Each comment has a `user` field (ObjectId)
          foreignField: "_id", // Match with the `_id` in users collection
          as: "commentUsers", // Store the matched user documents here
        },
      },
      {
        // Replace the `comments` array to include full user details for each comment
        $addFields: {
          comments: {
            $map: {
              input: "$comments", // Iterate over each comment in the `comments` array
              as: "comment", // Alias for the current comment element
              in: {
                user: {
                  // Find the user object that matches the comment's user ID
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$commentUsers", // Search in the previously joined users
                        cond: { $eq: ["$$this._id", "$$comment.user"] }, // Match by ID
                      },
                    },
                    0, // Get the first match (should be only one user)
                  ],
                },
                // Include comment content and creation time in the new structure
                content: "$$comment.content",
                createdAt: "$$comment.createdAt",
              },
            },
          },
        },
      },
      {
        // Remove the temporary field `commentUsers` since it's no longer needed
        $project: {
          commentUsers: 0,
        },
      },
    ]);

    console.log(posts);

    res.json({ success: true, posts: posts });
  } catch (error) {
    console.log(error);
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
    console.log(
      "post commented, recieved data , ",
      req.body.postId,
      req.body.data,
      req.body
    );
    if (!req.body.postId || !req.body.data) {
      return res.json({ success: false, message: "Invalid data" });
    }

    const job = await commentQueue.add(
      "commentPost",
      {
        postId: req.body.postId,
        comment: req.body.data,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 200,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      }
    );

    const { success, message, commentData } = await job.waitUntilFinished(
      getQueueEvents("commentQueue")
    );

    res.json({
      success,
      message,
      commentData,
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
