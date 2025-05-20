import mongoose from "mongoose";
import { NotifData } from "../controllers/notifController";
import notificationModel from "../models/notificationModel";

export const notifService = {
  AddOrDropLikeNotif: async (data: NotifData): Promise<any> => {
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
  },
  AddOrDropFollowNotif: async (data: NotifData): Promise<any> => {
    try {
      const isNotifExist = await notificationModel.findOne({
        $and: [
          { sender: { $eq: data.sender } },
          { receiver: { $eq: data.receiver } },
          { type: { $eq: "follow" } },
        ], // only trace  the like type notif
      });

      if (isNotifExist) {
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
  },
  batchSaveComments: async (
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
  },
};
