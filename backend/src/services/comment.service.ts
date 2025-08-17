import { ObjectId } from "mongoose";
import CommentModel, { IComment } from "../models/commentModel";
import { errorLog } from "./errHandler";
import { notificationQueue } from "../queues/notification/notificationQueue";
import { commentQueue } from "../queues/post/commentQueue";
import { getErrDelayjson } from "../queues/getErrDelayjson";

export interface UserData {
  _id: string;
  profilePicture?: string;
  fullName: string;
}

export interface PostRequestPayload {
  postId: string;
  postOwnerId: string;
  postOwnerName: string;
}

export interface CommentRequestPayload {
  user: UserData;
  post: PostRequestPayload;
  content: string;
  createdAt: Date;
}

export const commentService = {
  addComment: async (payload: CommentRequestPayload) => {
    try {
      await commentQueue.add(
        "addComment",
        generateCommentPayload(payload),
        getErrDelayjson()
      );

      await notificationQueue.add("notifyComment", payload, getErrDelayjson());
    } catch (error) {
      errorLog("commentService", error as Error);
      throw error;
    }
  },
  createComment: async (payload: {
    user: string;
    postId: string;
    content: string;
    createdAt: Date;
  }) => {
    try {
      await CommentModel.create(payload);
    } catch (error) {
      throw error;
    }
  },
  getUsersUniqueIds: async (payload: { postId: string; userId: string }) => {
    try {
      const { postId, userId } = payload;
      // Get unique user IDs who previously commented (except current user)
      const userIds = await CommentModel.distinct("user", {
        postId: postId,
        user: { $ne: userId },
      });

      return userIds ?? [];
    } catch (error) {
      errorLog("getUsersUniqueIds", error as Error);
      return [];
    }
  },
  getComments: async (payload: {
    postId: string;
    cursor?: string;
    limit?: number;
  }): Promise<{ comments: IComment[]; hasMore: boolean }> => {
    try {
      let comments = {} as IComment[];
      const { cursor, postId, limit = 10 } = payload;

      comments = await CommentModel.find({
        postId,
        ...(cursor && { createdAt: { $lt: new Date(cursor) } }),
      })
        .populate("user", "fullName username profilePicture ")
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .lean();

      const hasMore = comments.length > limit;
      if (hasMore) {
        comments.pop();
      }

      comments = comments.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );

      return { comments, hasMore };
    } catch (error) {
      throw error;
    }
  },
};

// modular functions
interface CommentPayload {
  user: string;
  postId: string;
  content: string;
  createdAt: Date;
}

export const generateCommentPayload = (
  payload: CommentRequestPayload
): CommentPayload => {
  return {
    user: payload.user._id,
    postId: payload.post.postId,
    content: payload.content,
    createdAt: payload.createdAt,
  };
};
