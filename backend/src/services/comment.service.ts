import { ObjectId } from "mongoose";
import CommentModel, { IComment } from "../models/commentModel";
import { errorLog } from "./errHandler";
import { notificationQueue } from "../queues/notification/notificationQueue";
import { commentQueue } from "../queues/post/commentQueue";

export interface UserData {
  id: string;
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

      await notificationQueue.add(
        "notifyComment",
        generatePostCommentPayload(payload),
        getErrDelayjson()
      );
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
  }): Promise<IComment[]> => {
    try {
      let comments = {} as IComment[];
      const { cursor, postId } = payload;
      if (cursor) {
        comments = await CommentModel.find({
          postId,
          createdAt: { $lt: new Date(cursor) },
        }).populate("user", "fullName username profilePicture ");
      }

      return comments;
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

export const generateCommentPayload = async (
  payload: CommentRequestPayload
): Promise<CommentPayload> => {
  return {
    user: payload.user.id,
    postId: payload.post.postId,
    content: payload.content,
    createdAt: payload.createdAt,
  };
};
function generatePostCommentPayload(payload: CommentRequestPayload) {
  return {
    sender: payload.user,
    post: payload.post,
    createdAt: payload.createdAt,
  };
}
