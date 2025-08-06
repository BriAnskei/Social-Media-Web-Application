import mongoose, { Types } from "mongoose";
import { NotifData } from "../controllers/notifController";
import notificationModel, { INotification } from "../models/notificationModel";
import { UserData } from "./comment.service";
import { errThrower } from "./errHandler";

interface CommentPayload {
  receiver: string;
  sender: string;
  post: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

export const notifService = {
  addCommentNotif: async (payload: CommentPayload): Promise<INotification> => {
    try {
      return await notificationModel.create(payload);
    } catch (error) {
      throw error;
    }
  },
  notfifyFollowerOnUploadPost: async (payload: {
    userId: string;
    postId: string;
  }): Promise<void> => {
    try {
    } catch (error) {
      errThrower("notfifyFollowerOnUploadPost", error as Error);
    }
  },
  createOrDropNotif: async (
    payload: NotifData,
    session: mongoose.mongo.ClientSession
  ) => {
    const { sender, post, type } = payload;

    try {
      const isNotifExist = await notificationModel
        .findOne({
          $and: [
            { sender: { $eq: sender } },
            { post: { $eq: post } },
            { type: { $eq: type } },
          ],
        })
        .session(session);

      if (isNotifExist) {
        return await deleteExistingNotif(isNotifExist, session);
      }
      return await createNewNotif(payload, session);
    } catch (error) {
      throw new Error("createOrDropNotif, " + (error as Error));
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
  ): Promise<{
    success: boolean;
    bulkResData: {
      _id: Types.ObjectId;
      receiver: string;
      sender: string;
      post: string;
      message: string;
      type: string;
      read: boolean;
      createdAt: Date;
    }[];
  }> => {
    try {
      const res = await notificationModel.insertMany(data);
      return {
        success: true,
        bulkResData: res,
      };
    } catch (error) {
      throw new Error("batchSaveComments, " + (error as Error));
    }
  },
};

// module functions

async function createNewNotif(
  data: NotifData,
  session: mongoose.mongo.ClientSession
) {
  try {
    const [Notification] = await notificationModel.create(
      [
        {
          receiver: mongoose.Types.ObjectId.createFromHexString(data.receiver),
          sender: mongoose.Types.ObjectId.createFromHexString(data.sender),
          post: data.post
            ? mongoose.Types.ObjectId.createFromHexString(data.post)
            : undefined,

          message: data.message,
          type: data.type,
        },
      ],
      { session }
    );
    return { isExist: false, data: Notification };
  } catch (error) {
    throw new Error("createNewNotif, " + (error as Error));
  }
}

async function deleteExistingNotif(
  isNotifExist: mongoose.Document<unknown, {}, INotification> &
    INotification &
    Required<{ _id: mongoose.Types.ObjectId }> & { __v: number },
  session: mongoose.mongo.ClientSession
) {
  try {
    await notificationModel.deleteOne(
      {
        $and: [
          { _id: isNotifExist._id },
          { sender: { $eq: isNotifExist.sender } },
          { post: { $eq: isNotifExist.post } },
          { type: { $eq: isNotifExist.type } },
        ],
      },
      { session }
    );

    return { isExist: Boolean(isNotifExist), data: isNotifExist };
  } catch (error) {
    throw new Error("deleteExistingNotif, " + (error as Error));
  }
}
