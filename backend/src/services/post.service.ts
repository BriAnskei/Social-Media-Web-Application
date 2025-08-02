import mongoose, { ClientSession } from "mongoose";
import { ExtentRequest } from "../controllers/postController";
import postModel, { IPost } from "../models/postModel";

export const postService = {
  fetchAllPost: async () => {
    try {
      const posts = await postModel
        .find()
        .populate("user", "fullName username profilePicture followers")
        .populate("totalComments")
        .lean();

      return posts;
    } catch (error) {
      throw error;
    }
  },
  toggleLikeRetrivePostData: async (
    payload: { userId: string; postId: string },
    session: ClientSession
  ): Promise<{
    isUserNotThePostOwner: boolean;
    postOwnerId: string;
  }> => {
    try {
      const { userId, postId } = payload;
      const userObjectId = mongoose.Types.ObjectId.createFromHexString(userId);
      const post = await postModel.findById(postId).session(session);

      if (!post) {
        throw new Error(
          "Failed on toggleLikeRetrivePostData inputs, post cannot be found"
        );
      }

      const isUserNotThePostOwner = post.user.toString() !== userId.toString();
      const hasLiked = post.likes.some((like) => like.equals(userObjectId));

      if (hasLiked) {
        post.likes = post.likes.filter((like) => !like.equals(userObjectId));
      } else {
        post.likes.push(userObjectId);
      }

      await post.save({ session });

      return { isUserNotThePostOwner, postOwnerId: post.user.toString() };
    } catch (error) {
      throw new Error("toggleLikeRetrivePostData , " + (error as Error));
    }
  },
  getAllUsersIdsInPostComment: async (postId: string) => {
    try {
      if (!postId) throw new Error("No post Id received to fetch all id");

      const result = await postModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(postId) } },
        { $project: { commenters: "$comments.user" } },
      ]);

      if (!result.length) {
        throw new Error("Post data cannot be found");
      }

      return result[0].commenters;
    } catch (error) {
      throw new Error("getAllUsersIdsInPostComment,  " + (error as Error));
    }
  },
  commentOnPost: async (payload: {
    postId: string;
    comment: { user: string; content: string; createdAt: Date };
  }): Promise<IPost> => {
    try {
      const { postId, comment } = payload;
      const postData = (await postModel.findOneAndUpdate(
        { _id: postId },
        { $push: { comments: comment } },
        { new: true }
      )) as IPost;

      return postData;
    } catch (error) {
      throw new Error("commentOnPost, " + (error as Error));
    }
  },
};

export const postRequestHanlder = {
  getCreatePostPayload: (req: ExtentRequest) => {
    try {
      const userId = req.userId;

      if (!userId) throw new Error("User Id is required");

      return {
        user: mongoose.Types.ObjectId.createFromHexString(userId),
        content: req.body.content,
        image: req.file?.filename,
      };
    } catch (error) {
      throw new Error("getCreatePostPayload " + (error as Error));
    }
  },
};
