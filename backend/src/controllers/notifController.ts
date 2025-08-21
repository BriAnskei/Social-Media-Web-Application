import { Request, Response } from "express";
import notificationModel, { INotification } from "../models/notificationModel";
import mongoose from "mongoose";
import { log } from "console";
import { errorLog } from "../services/errHandler";
import { notifService } from "../services/notification.service";

interface initialReq extends Request {
  userId?: string;
}

export interface NotifData {
  _id?: string;
  receiver: string;
  sender: string;
  post?: string;
  message: string;
  type: string;
  createdAt?: Date;
}

export const saveCommentNotif = async (data: NotifData): Promise<any> => {
  try {
    const notifdata = await notificationModel.create({
      receiver: mongoose.Types.ObjectId.createFromHexString(data.receiver),
      sender: mongoose.Types.ObjectId.createFromHexString(data.sender),
      post: mongoose.Types.ObjectId.createFromHexString(data.post! || "null"),
      message: data.message,
      type: data.type,
      createdAt: data.createdAt,
    });
    return notifdata;
  } catch (error) {
    console.error("Error persisting comment data");
    return null;
  }
};

export const getNotification = async (
  req: initialReq,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const cursor = req.query.cursor as string;

    const fetcherRespinse = await notifService.fetchNotifications({
      cursor,
      userId: userId!.toString(),
    });

    const { notifications, hasMore } = fetcherRespinse!;

    res.json({ success: true, notifications, hasMore });
  } catch (error) {
    errorLog("getNotification", error as Error);
    res.json({ success: false, message: "Error" });
  }
};

export const setReadNotification = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { allIds } = req.body;
    console.log("ALL ids recievd: ", allIds);

    if (!allIds || !Array.isArray(allIds) || allIds.length === 0) {
      return res.json({
        success: false,
        message: "Please provide a valid array of notification IDs",
      });
    }

    const result = await notificationModel.updateMany(
      { _id: { $in: allIds } },

      { $set: { read: true } }
    );

    if (result.matchedCount === 0) {
      return res.json({
        success: false,
        message: "No notification has been updated",
      });
    }

    res.json({
      success: true,
      message: `${result.matchedCount} notification(s) marked as read`,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

export const deleteNotifs = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const postId = req.body.postId;

    console.log(postId);

    if (!postId) {
      return res.json({
        success: false,
        message: "No Id has been recieved in the controller",
      });
    }

    const result = await notificationModel.deleteMany({ post: postId });

    res.json({
      success: false,
      message: `Notification succesfully remove from DB, deleted count: ${result.deletedCount}`,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};
