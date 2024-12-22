import { Request, Response } from "express";
import postModel, { IPost } from "../models/postModel";

export const createPost = async (req: Request, res: Response): Promise<any> => {
  try {
    const { user, content, image } = req.body;
    console.log(image);

    await postModel.create({
      user,
      content,
      image,
    });

    res.json({ success: true, message: "post successfully created" });
  } catch (error) {
    console.log("Create Post:", error);
    res.json({ success: false, message: "Error" });
  }
};
