import { ObjectId } from "mongoose";
import { IConversation } from "../models/conversationModel";
import { IMessage } from "../models/messageModel";
import { UserData } from "../services/comment.service";
import {
  CommentEventPayload,
  LikeEventPayload,
} from "../socket/EventsTypes/PostEvents";

import { redisEvents } from "./redisEvents";
import { INotification } from "../models/notificationModel";

export const emitMessageOnSend = async (data: {
  conversation: IConversation;
  messageData: IMessage;
}) => {
  try {
    const success = await redisEvents.emit("app_message_on_sent", data);

    if (success) {
      console.log("✅ Message event published to Redis successfully");
    } else {
      console.error("❌ Failed to publish message event to Redis");
    }
  } catch (error) {
    console.error("Failed to emitMessageOnSend", error);
    throw error;
  }
};

export const emitPostLiked = async (config: LikeEventPayload) => {
  try {
    const success = await redisEvents.emit("post-like", config);

    if (success) {
      console.log("✅ emitPostLiked published to Redis successfully");
    } else {
      console.error("❌ Failed emitPostLiked");
    }
  } catch (error) {
    throw new Error("emitPostLiked , " + (error as Error));
  }
};

export const emitCreateUpdateContact = async (data: any) => {
  try {
    const success = await redisEvents.emit("createOrUpdate-contact", data);

    if (success) {
      console.log("✅ createUpdateContact published to Redis successfully");
    } else {
      console.error("❌ Failed createUpdateContact");
    }
  } catch (error) {
    throw new Error("createUpdateContact , " + (error as Error));
  }
};

export const emitUpdateDropContact = async (data: any) => {
  try {
    const success = await redisEvents.emit("updateOrDrop-contact", data);

    if (success) {
      console.log("✅ emitUpdateDropContact published to Redis successfully");
    } else {
      console.error("❌ Failed emitUpdateDropContact");
    }
  } catch (error) {
    throw new Error("emitUpdateDropContact , " + (error as Error));
  }
};

export const emitComment = async (payload: INotification) => {
  try {
    const success = await redisEvents.emit("newNotification", payload);
    throwErrOnFailed({ function: "emitComment", isSucces: success });
  } catch (error) {
    logEmitterErr("emitComment", error as Error);
  }
};

function throwErrOnFailed(res: { function: string; isSucces: boolean }): void {
  if (!res.isSucces) {
    throw new Error(`${res.function}, 'Failed to emit on channed`);
  }
}

function logEmitterErr(functions: string, err: Error): void {
  console.error(`${functions}, ${err}`);
}
