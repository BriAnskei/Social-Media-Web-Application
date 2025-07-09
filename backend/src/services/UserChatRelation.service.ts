import mongoose, { ObjectId } from "mongoose";
import { Conversation, IConversation } from "../models/conversationModel";
import { contactService } from "./contact.service";
import { conversationFormatHelper, ConvoService } from "./conversation.service";
import { messageService } from "./message.service";
import { IMessage } from "../models/messageModel";

export interface ChatRelationPayload {
  payload: {
    userId: string;
    otherUserId: string;
  };
  isUnfollowing: boolean;
}

export const UserChatRelationService = {
  dropConversation: async (contactId: string, userId: string) => {
    try {
      const conversation = await ConvoService.getConvoByContactId(contactId);
      const isPermanent = true;

      await ConvoService.deleteConvoByContactId(contactId);

      await messageService.deleteMessages(
        isPermanent,
        conversation?._id as string,
        userId
      );

      return conversation?._id as string;
    } catch (error) {
      console.log("Failed to dropConversation", error);
    }
  },
  dropCovoMessagesOnValidUsers: async (
    userId: string,
    contactId: string,
    validUsers: mongoose.Types.ObjectId[]
  ) => {
    try {
      const conversation = await ConvoService.getConvoByContactId(contactId);

      await ConvoService.updateForValidUser(contactId, validUsers);

      const isPermanent = false;
      await messageService.deleteMessages(
        isPermanent,
        conversation?._id as string,
        userId
      );

      return conversation?._id as string;
    } catch (error) {
      console.log("failed to updateChatValidUsers, ", error);
    }
  },
  emitMessageAndUpdateConvoMessage: async (
    messageData: IMessage,
    convoId: string
  ): Promise<IConversation | null> => {
    try {
      const { sender, recipient } = messageData;
      const convoData = await ConvoService.setLatestCovoMessage(
        convoId,
        messageData
      );

      // Add null check before proceeding
      if (!convoData || !convoData.validFor) {
        throw new Error(
          "emitMessageAndUpdateConvoMessage, Error:  returned null | Conversation data missing validFor property"
        );
      }

      const formattedConvoData =
        conversationFormatHelper.formatConversationData(
          convoData,
          sender.toString(),
          convoData.validFor
        );

      messageService.emitMessageOnSend({
        conversation: formattedConvoData,
        messageData,
      });

      return convoData;
    } catch (error) {
      console.log("Error in emitMessageAndUpdateConvoMessage:", error);
      throw new Error(
        `Failed to emitMessageAndUpdateConvoMessage: ${
          (error as Error).message
        }`
      );
    }
  },
  updateConvoMsgReadOnSend: async (payload: {
    conversation: IConversation;
    userId: string;
  }) => {
    try {
      const { conversation, userId } = payload;

      if (!conversation) {
        throw new Error(
          "updateConvoMsgReadOnSend, Error: no conversation has this in payload"
        );
      }

      console.log(
        "updateConvoMsgReadOnSend".toUpperCase(),
        "COnversation last lasg messaage: ",
        payload.conversation.lastMessage
      );

      await ConvoService.setLastMessageOnRead({ conversation, userId });
    } catch (error) {
      throw new Error("updateConvoMsgReadOnSend,  " + (error as Error).message);
    }
  },
  updateChatRelation: async (data: ChatRelationPayload) => {
    const { payload, isUnfollowing } = data;
    const { userId, otherUserId } = payload;

    if (isUnfollowing) {
      await contactService.updateValidUserOrDropContact(userId, otherUserId);
    } else {
      await contactService.createOrUpdateContact(userId, otherUserId);
    }
  },
  updateValidConvoUsers: async (
    contactId: string,
    validUsers: mongoose.Types.ObjectId[]
  ) => {
    const conversation = await Conversation.findOne({ contactId });

    if (conversation) {
      await ConvoService.updateForValidUser(contactId, validUsers);
    }

    return conversation?.id as string;
  },
};
