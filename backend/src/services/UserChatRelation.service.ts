import mongoose from "mongoose";
import { Conversation } from "../models/conversationModel";
import { contactService } from "./contact.service";
import { ConvoService } from "./conversation.service";
import { messageService } from "./message.service";

export interface ChatRelationPayload {
  payload: {
    userId: string;
    otherUserId: string;
  };
  isUnfollowing: boolean;
}

export const UserChatRelationService = {
  checkConversationForValidUsers: async (
    contactId: string,
    validUsers: mongoose.Types.ObjectId[]
  ) => {
    const conversation = await Conversation.findOne({ contactId });

    if (conversation) {
      await ConvoService.updateForValidUser(contactId, validUsers);
    }
  },
  dropConversation: async (contactId: string, userId: string) => {
    try {
      const conversation = await ConvoService.getConvoByContactId(contactId);
      const isPermanent = true;

      await ConvoService.deleteConvoByContactId(contactId, userId);

      await messageService.deleteMessages(
        isPermanent,
        conversation?._id as string,
        userId
      );
    } catch (error) {
      console.log("Failed to dropConversation", error);
    }
  },
  dropMessagesOnValidUsers: async (
    userId: string,
    contactId: string,
    validUsers: mongoose.Types.ObjectId[]
  ) => {
    try {
      const conversation = await ConvoService.getConvoByContactId(contactId);
      const isPermanent = false;

      await ConvoService.updateForValidUser(contactId, validUsers);

      await messageService.deleteMessages(
        isPermanent,
        conversation?._id as string,
        userId
      );
    } catch (error) {
      console.log("failed to updateChatValidUsers, ", error);
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
};
