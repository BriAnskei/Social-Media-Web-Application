import { Request, Response } from "express";
import postModel from "../models/postModel";

interface ExtentRequest extends Request {
  userId?: string;
}

export const createPost = async (
  req: ExtentRequest,
  res: Response
): Promise<void> => {
  try {
    await postModel.create({
      user: req.userId,
      content: req.body.content,
      image: req.file?.filename,
    });

    res.json({ success: true, message: "post successfully created" });
  } catch (error) {
    console.log("Create Post:", error);
    res.json({ success: false, message: "Error" });
  }
};

export const postsLists = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const allPost = await postModel.find({});

    res.json({ success: true, data: allPost });
  } catch (error) {
    console.log("Fetching post Post:", error);
    res.json({ success: false, message: "Error" });
  }
};
