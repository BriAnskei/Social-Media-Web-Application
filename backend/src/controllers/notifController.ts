import { Request, Response } from "express";
import notificationModel, { INotification } from "../models/notificationModel";
import mongoose from "mongoose";
import { log } from "console";

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

export const saveLikeNotification = async (data: NotifData): Promise<any> => {
  try {
    const isNotifExist = await notificationModel.findOne({
      $and: [
        { sender: { $eq: data.sender } },
        { post: { $eq: data.post } },
        { type: { $eq: "like" } },
      ], // only trace  the like type notif
    });

    if (isNotifExist) {
      await notificationModel.deleteOne({
        $and: [
          { _id: isNotifExist._id },
          { sender: { $eq: isNotifExist.sender } },
          { post: { $eq: isNotifExist.post } },
          { type: { $eq: isNotifExist.type } },
        ],
      });

      return { isExist: Boolean(isNotifExist), data: isNotifExist };
    }

    const notifdata = await notificationModel.create({
      receiver: mongoose.Types.ObjectId.createFromHexString(data.receiver),
      sender: mongoose.Types.ObjectId.createFromHexString(data.sender),
      post: mongoose.Types.ObjectId.createFromHexString(data.post! || "null"),
      message: data.message,
      type: data.type,
    });
    return { isExist: false, data: notifdata };
  } catch (error) {
    console.log("Failed to save notification: ", error);
    return { isExist: false, data: null };
  }
};

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

export const saveFollowNotif = async (data: NotifData): Promise<any> => {
  try {
    const isNotifExist = await notificationModel.findOne({
      $and: [
        { sender: { $eq: data.sender } },
        { receiver: { $eq: data.receiver } },
        { type: { $eq: "follow" } },
      ], // only trace  the like type notif
    });

    if (isNotifExist) {
      console.log("Notif exist deleting doc");

      await notificationModel.deleteOne({
        $and: [
          { _id: isNotifExist._id },
          { sender: { $eq: isNotifExist.sender } },
          { receiver: { $eq: isNotifExist.receiver } },
          { type: { $eq: isNotifExist.type } },
        ],
      });

      return { isExist: Boolean(isNotifExist), data: isNotifExist };
    }

    const notifData = await notificationModel.create({
      receiver: mongoose.Types.ObjectId.createFromHexString(data.receiver),
      sender: mongoose.Types.ObjectId.createFromHexString(data.sender),
      message: data.message,
      type: data.type,
      createdAt: data.createdAt,
    });
    return { isExist: false, data: notifData };
  } catch (error) {
    console.error("Error persisting notif data");
    return { isExist: false, data };
  }
};

export const getNotification = async (
  req: initialReq,
  res: Response
): Promise<any> => {
  try {
    const notifications = await notificationModel
      .find({
        receiver: { $eq: req.userId },
      })
      .sort({ createdAt: -1 }); // sort by date

    res.json({ success: true, notifications });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

export const setReadNotification = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { allIds } = req.body;

    if (!allIds || !Array.isArray(allIds) || allIds.length === 0) {
      return res.json({
        success: false,
        message: "Please provide a valid array of notification IDs",
      });
    }

    // Update all notifications matching the IDs in the array
    const result = await notificationModel.updateMany(
      { _id: { $in: allIds } },
      // Look for documents where the _id field matches any value inside the notificationIds array.
      // $in is a MongoDB query operator that means "match any value from this array."
      { $set: { read: true } }
    );

    // result output
    // acknowledged: Did MongoDB acknowledge the update command?
    // matchedCount: How many documents matched the filter (how many notifications were found)?
    // modifiedCount: How many documents were actually updated? (Sometimes matchedCount and modifiedCount can be different if some documents already had read: true.)

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

// for bacth notif in socket server
export const bulkSave = async (
  data: {
    receiver: string;
    sender: string;
    post: string;
    message: string;
    type: string;
    createdAt: Date;
  }[]
) => {
  try {
    const res = await notificationModel.insertMany(data);
    return {
      success: true,
      bulkResData: res,
    };
  } catch (error) {
    console.log("Error savinf bulk notif: ", error);
    return {
      success: false,
      bulkResData: [],
    };
  }
};
