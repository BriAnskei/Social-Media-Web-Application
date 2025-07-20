import { ReqAuth } from "../controllers/messageController";

import { IConversation } from "../models/conversationModel";
import { IMessage, MessageModel } from "../models/messageModel";
import { messageHanlder } from "../server";
import {
  builtMessagePayloadBasedOnRecipeintStatus,
  IMessageInput,
} from "../utils/buildMessagePayload";
import { ConvoService, FormattedConversation } from "./conversation.service";

import { UserChatRelationService } from "./UserChatRelation.service";
export const messageService = {
  createMessageAndUpdateConvo: async (
    messageData: IMessageInput,
    convoId: string
  ): Promise<IMessage> => {
    try {
      const message = await MessageModel.create(messageData);

      await UserChatRelationService.updateEmitConvoAndGetFormatData(
        message,
        convoId
      );

      if (!message) {
        throw new Error(
          "createMessageAndUpdateConvo, Error: invalid return type"
        );
      }

      return message;
    } catch (error) {
      throw new Error("createMessageAndUpdateConvo, " + (error as Error));
    }
  },
  checkMessageOnReadForUnreadCounts: async (messageData: IMessage) => {
    try {
      if (!messageData.read) {
        await ConvoService.incrementMessageUnreadOnNotViewConvo(
          messageData.conversationId.toString(),
          messageData.recipient.toString(),
          messageData._id as string
        );
      }
    } catch (error) {
      throw new Error(
        "checkMessageOnReadForUnreadCounts,  " + (error as Error)
      );
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
};

export const requesHanlder = {
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
