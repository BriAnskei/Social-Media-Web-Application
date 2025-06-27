import { ReqAuth } from "../controllers/messageController";
import { appEvents } from "../events/appEvents";
import { IMessage, MessageModel } from "../models/messageModel";
import { messageHanlder } from "../server";
import {
  buildMessagePayload,
  IMessageInput,
} from "../utils/buildMessagePayload";
import { UserChatRelationService } from "./UserChatRelation.service";
export const messageService = {
  createMessageAndUpdateConvo: async (messageData: IMessageInput) => {
    try {
      const message = await MessageModel.create(messageData);
      const conversationId = message.conversationId.toString();

      await UserChatRelationService.emitMessageAndUpdateConvoMessage(
        message,
        conversationId
      );
      return message;
    } catch (error) {
      console.log("Failed to createMessageAndEmit", error);
      throw new Error("Error in createMessageAndEmit" + error);
    }
  },
  deleteMessages: async (
    isPermanent: boolean,
    conversationId: string,
    userId: string
  ) => {
    try {
      let result,
        success = false;
      if (isPermanent) {
        result = await MessageModel.deleteMany({ conversationId });
        success = result.acknowledged;
      } else {
        result = await MessageModel.updateMany(
          { conversationId },
          { hideFrom: userId }
        );
        success = result.acknowledged;
      }

      return { result, success };
    } catch (error) {
      throw new Error(`Failed to delete messages: ${(error as Error).message}`);
    }
  },
  emitMessageOnSend: (data: {
    conversationId: string;
    messageData: IMessage;
  }) => {
    try {
      appEvents.emit("app_message_on_sent", data);
    } catch (error) {
      console.error("Failed to emitMessageOnSend", error);
      throw error;
    }
  },

  markReadMessages: async (conversationId: string, userId: string) => {
    try {
      const result = await MessageModel.updateMany(
        { conversationId, recipient: userId, read: false },
        { read: true, readAt: Date.now() }
      );

      return result;
    } catch (error) {
      throw new Error(
        `Failed to mark as read messages: ${(error as Error).message}`
      );
    }
  },
  createPayloadForActiveRecipient: (req: ReqAuth) => {
    try {
      const convoId = req.params.conversationId;
      const recipientId = req.body.recipient;

      const messagePayload = buildMessagePayload(
        req,
        messageHanlder.isActiveRecipient(convoId, recipientId)
      );

      return messagePayload;
    } catch (error) {
      console.log("Failed to buildPayloadOnActiveConvoRecipient", error);
      throw error;
    }
  },
};
