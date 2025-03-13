import { Request, Response } from "express";
import postModel from "../models/postModel";
import mongoose from "mongoose";

interface ExtentRequest extends Request {
  userId?: string;
}

export const createPost = async (
  req: ExtentRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) throw new Error("User Id is required");

    const userObjectId = mongoose.Types.ObjectId.createFromHexString(userId); //hexadecimal string into a valid ObjectId instance.

    await postModel.create({
      user: userObjectId,
      content: req.body.content,
      image: req.file?.filename,
    });

    const allPost = await postModel.find({});

    res.json({
      success: true,
      message: "post successfully created",
      posts: allPost,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export const postsLists = async (_: Request, res: Response): Promise<void> => {
  try {
    const allPost = await postModel.find({});

    res.json({ success: true, posts: allPost });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export const likeToggled = async (req: ExtentRequest, res: Response) => {
  try {
    const { postId } = req.body;
    const userId = req.userId;
    if (!postId || !userId) throw new Error("No post/userID ID attached");

    const post = await postModel.findById(postId);

    if (!post) throw new Error("post not found");

    const userObjectId = mongoose.Types.ObjectId.createFromHexString(userId);

    const hasLiked = post.likes.some((like) => like.equals(userObjectId));

    if (hasLiked) {
      post.likes = post.likes.filter((like) => !like.equals(userObjectId));
    } else {
      post.likes.push(userObjectId);
    }

    await post.save();
    res.json({ success: true, message: "like toggled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export const addComment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { data } = req.body;

    if (!data.postId || !data.data) throw new Error("Invalid data recieved");

    const postData = await postModel.findById(data.postId);

    if (!postData) {
      return res.json({ success: false, message: "Post not found" });
    }

    postData.comments.push(data.data);

    const commentData = postData.comments[postData.comments.length - 1];

    await postData.save();
    res.json({
      success: true,
      message: "Comment succesfully added",
      commentData,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
