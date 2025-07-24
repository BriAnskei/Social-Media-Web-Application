import { IConversation } from "../models/conversationModel";
import { IMessage } from "../models/messageModel";
import {
  CommentEventPayload,
  LikeEventPayload,
} from "../socket/EventsTypes/PostEvents";

import { redisEvents } from "./redisEvents";

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

export const emitPostComment = async (cnfg: CommentEventPayload) => {
  try {
    const success = await redisEvents.emit("post-comment", cnfg);

    if (success) {
      console.log("✅ emitPostComment published to Redis successfully");
    } else {
      console.error("❌ Failed emitPostComment");
    }
  } catch (error) {
    throw new Error("emitPostComment , " + (error as Error));
  }
};
