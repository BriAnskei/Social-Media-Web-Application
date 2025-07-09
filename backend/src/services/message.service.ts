import { ReqAuth } from "../controllers/messageController";
import { appEvents } from "../events/appEvents";
import { IConversation } from "../models/conversationModel";
import { IMessage, MessageModel } from "../models/messageModel";
import { messageHanlder } from "../server";
import {
  builtMessagePayloadBasedOnRecipeintStatus,
  IMessageInput,
} from "../utils/buildMessagePayload";
import { FormattedConversation } from "./conversation.service";

import { UserChatRelationService } from "./UserChatRelation.service";
export const messageService = {
  createMessageAndUpdateConvo: async (
    messageData: IMessageInput,
    convoId: string
  ): Promise<{ message: IMessage; conversation: IConversation }> => {
    try {
      const message = await MessageModel.create(messageData);

      const conversation =
        await UserChatRelationService.emitMessageAndUpdateConvoMessage(
          message,
          convoId
        );

      if (!message || !conversation) {
        throw new Error(
          "createMessageAndUpdateConvo, Error: invalid return type"
        );
      }

      return { message, conversation };
    } catch (error) {
      throw new Error("createMessageAndUpdateConvo, " + (error as Error));
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
    conversation: FormattedConversation;
    messageData: IMessage;
  }) => {
    try {
      appEvents.emit("app_message_on_sent", data);
    } catch (error) {
      console.error("Failed to emitMessageOnSend", error);
      throw error;
    }
  },
  getMessgeById: async (msgId: string): Promise<IMessage | null> => {
    try {
      return await MessageModel.findOne({ _id: msgId });
    } catch (error) {
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
      const messagePayload = builtMessagePayloadBasedOnRecipeintStatus(
        req,
        messageHanlder.isActiveRecipient(convoId, recipientId)
      );

      return { messagePayload, convoId };
    } catch (error) {
      console.log("Failed to createPayloadForActiveRecipient", error);
      throw error;
    }
  },
};
