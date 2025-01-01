import { Request, Response } from "express";
import postModel, { IPost } from "../models/postModel";

export const createPost = async (req: Request, res: Response): Promise<any> => {
  try {
    await postModel.create({
      user: req.body.user,
      content: req.body.user,
      image: `${req.file?.filename}`,
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
