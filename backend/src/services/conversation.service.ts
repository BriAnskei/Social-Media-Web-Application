import mongoose from "mongoose";
import { Conversation, IConversation } from "../models/conversationModel";

export const ConvoService = {
  increamentUnread: async (
    conversationId: string,
    recipentId: string,
    newMessageId: string
  ) => {
    try {
      const conversation = await Conversation.findById(conversationId);

      if (!conversation || !newMessageId) {
        throw new Error(
          "Conversation does not exist for sending this message or message id might be undifined"
        );
      }

      return await Conversation.updateOne(
        {
          _id: conversation._id,
          "unreadCounts.user": recipentId,
        },
        {
          $inc: { "unreadCounts.$.count": 1 }, // using  positional $ operator  in which index is to update
          lastMessage: newMessageId,
          lastMessageAt: new Date(),
        }
      );
    } catch (error) {
      throw new Error(
        `Failed to update unread counts: ${(error as Error).message}`
      );
    }
  },

  validateConversation: async (contactId: string, userId: string) => {
    try {
      const conversation = await Conversation.findOne({ contactId });

      if (!conversation) {
        throw new Error(
          "Failed to validate user on Conversation: Conversation with this contactId does not exist"
        );
      }

      const isUserValid = conversation.validFor.includes(
        new mongoose.Types.ObjectId(userId)
      );

      if (!isUserValid) {
        await Conversation.updateOne(
          { _id: conversation._id },
          { $push: { validFor: userId } }
        );
      }
    } catch (error) {
      throw new Error(
        `Failed to  validate user for this conversation: ${
          (error as Error).message
        }`
      );
    }
  },

  undeleteConversation: async (contactId: string, userId: string) => {
    try {
      const conversation = await Conversation.findOne({ contactId });

      if (!conversation) {
        throw new Error(
          "Failed to undelete convo: Conversation with this contactId does not exist"
        );
      }

      const { deletedFor } = conversation;
      const userObjectId = new mongoose.Types.ObjectId(userId);

      conversation.deletedFor = deletedFor.filter((id) => id !== userObjectId);

      await conversation.save();

      return conversation.deletedFor;
    } catch (error) {
      throw new Error(
        `Failed toto undelete convo, ${(error as Error).message}`
      );
    }
  },

  updateForValidUser: async (
    contactId: string,
    validUsers: mongoose.Types.ObjectId[]
  ) => {
    try {
      const conversation = await Conversation.findOne({ contactId });

      if (!conversation) {
        throw new Error(
          "Failed to validate user for convo: Conversation with this contactId does not exist"
        );
      }

      conversation.validFor = validUsers;

      await conversation.save();

      return conversation.validFor;
    } catch (error) {
      throw new Error(
        `Failed toto undelete convo, ${(error as Error).message}`
      );
    }
  },
};

export const conversationFormatHelper = {
  formatConversationData: (
    conversation: IConversation,
    userId: string,
    validUser: mongoose.Types.ObjectId[]
  ) => {
    // format data for frontend
    const isUserValidToRply = validUser.toString().includes(userId.toString());

    const otherParticipant = conversation.participants.find(
      (user) => user._id.toString() !== userId!.toString()
    );

    // for unreadt counts
    const unreadData = conversation.unreadCounts.find(
      (unrd) => unrd.user.toString() === userId!.toString()
    );

    if (!otherParticipant || !unreadData) {
      throw new Error("Missing format dataa");
    }

    const formatedData = {
      _id: conversation._id,
      isUserValidToRply,
      otherUser: otherParticipant,
      lastMessage: conversation?.lastMessage,
      unreadCount: unreadData ? unreadData.count : 0,
    };

    return formatedData;
  },

  formatConversationArray: (conversations: IConversation[], userId: string) => {
    const formatedData = conversations.map((convo) => {
      const otherParticipants = convo.participants.find(
        (user) => user._id.toString() !== userId!.toString()
      );

      const unreadData = convo.unreadCounts.find(
        (unread) => unread.user._id.toString() === userId!.toString()
      );

      const isUserValidToRply = convo.validFor
        .toString()
        .includes(userId!.toString());

      return {
        _id: convo._id,
        isUserValidToRply,
        otherUser: otherParticipants,
        lastMessage: convo.lastMessage,
        lastMessageAt: convo.lastMessageAt,
        unreadCount: unreadData ? unreadData.count : 0,
        updatedAt: convo.updatedAt,
      };
    });

    return formatedData;
  },
};
