import { Request, Response } from "express";
import notificationModel, { INotification } from "../models/notificationModel";
import mongoose from "mongoose";

export interface NotifData {
  receiver: string;
  sender: string;
  post: string;
  message: string;
  type: string;
}

export const saveNotification = async (data: NotifData): Promise<any> => {
  try {
    if (!data) throw new Error("No Data");

    const isNotifExist = await notificationModel.findOne({
      $and: [
        { receiver: { $eq: data.receiver } },
        { sender: { $eq: data.sender } },
        { post: { $eq: data.post } },
      ],
    });
    if (isNotifExist) {
      await notificationModel.deleteOne({ receiver: data.receiver });
      console.log("notif data deleted", isNotifExist._id);

      return { isExist: Boolean(isNotifExist), data: isNotifExist };
    }

    const notifdata = await notificationModel.create({
      receiver: mongoose.Types.ObjectId.createFromHexString(data.receiver),
      sender: mongoose.Types.ObjectId.createFromHexString(data.sender),
      post: mongoose.Types.ObjectId.createFromHexString(data.post),
      message: data.message,
      type: data.type,
    });
    return { isExist: false, data: notifdata };
  } catch (error) {
    console.log("Failed to save notification: ", error);
    return { isExist: false, data: null };
  }
};

interface initialReq extends Request {
  userId?: string;
}

export const getNotification = async (
  req: initialReq,
  res: Response
): Promise<any> => {
  try {
    const notifications = await notificationModel.find({
      receiver: { $eq: req.userId },
    });

    res.json({ success: true, notifications });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};
