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

  updateEmitConvoAndGetFormatData: async (
    messageData: IMessage,
    convoId: string
  ): Promise<void> => {
    try {
      await messageService.checkMessageOnReadForUnreadCounts(messageData);
      const conversation = await ConvoService.updateConversationOnMessageSent({
        newMessage: messageData,
        convoId,
      });
    } catch (error) {
      console.log("Error in updateConvoAndGetFormatData:", error);
      throw new Error(
        `Failed to updateConvoAndGetFormatData: ${(error as Error).message}`
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
