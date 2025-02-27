import { Request, Response } from "express";
import notificationModel from "../models/notificationModel";
import mongoose from "mongoose";

export interface NotifData {
  receiver: string;
  sender: string;
  post: string;
  message: string;
  type: string;
}

export const saveNotification = async (data: NotifData): Promise<void> => {
  try {
    if (!data) throw new Error("No Data");

    await notificationModel.create({
      userId: mongoose.Types.ObjectId.createFromHexString(data.receiver),
      sender: mongoose.Types.ObjectId.createFromHexString(data.sender),
      post: mongoose.Types.ObjectId.createFromHexString(data.post),
      message: data.message,
      type: data.type,
    });

    console.log("Notification saved");
  } catch (error) {
    console.log("Failed to save notification: ", error);
  }
};

export const getNotification = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const notifications = await notificationModel.find({
      receiver: req.body.userId,
    });

    res.json({ sucess: true, data: notifications });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};
