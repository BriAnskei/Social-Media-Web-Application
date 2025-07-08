import mongoose from "mongoose";
import { Conversation, IConversation } from "../models/conversationModel";
import { messageService } from "./message.service";
import { IMessage } from "../models/messageModel";
import { ReqAuth } from "../controllers/convoController";
import { IUser } from "../models/userModel";
import { messageHanlder } from "../server";

interface ViewConvoPayload {
  userId: string;
  otherUser: string;
  contactId: string;
}

export const ConvoService = {
  buildViewPayload: (req: ReqAuth): ViewConvoPayload => {
    try {
      const userId = req.userId;
      const otherUser = req.body.otherUser;
      const { contactId } = req.params;

      return {
        userId: userId as string,
        otherUser,
        contactId,
      };
    } catch (error) {
      throw error;
    }
  },
  buildPayloadForFetchingConvo: (req: ReqAuth) => {
    const { userId } = req;
    if (!userId)
      throw new Error("Failed to buildPayloadForFetchingConvo: no userId");
    return {
      userId,
      cursor: req.body.cursor ? req.body.cursor.toString() : null,
      limit: Number(req.body.limit) || 10,
    };
  },
  createConversation: async (payload: {
    userId: string;
    otherUser: string;
    validUser: mongoose.Types.ObjectId[] | undefined;
    contactId: string;
  }): Promise<IConversation> => {
    try {
      const { userId, otherUser, validUser, contactId } = payload;
      const conversation = await Conversation.create({
        contactId,
        validFor: validUser,
        participants: [userId, otherUser],
        unreadCounts: [
          { user: new mongoose.Types.ObjectId(userId), count: 0 },
          { user: new mongoose.Types.ObjectId(otherUser), count: 0 },
        ],
      });
      return await (
        await conversation.populate("participants")
      ).populate("lastMessage");
    } catch (error) {
      throw error;
    }
  },
  deleteConvoByContactId: async (contactId: string) => {
    try {
      await Conversation.deleteOne({ contactId });
    } catch (error) {
      console.log("Failed to deleteConvoByContactId, ", error);
    }
  },
  findOneByContactIdPopulate: async (
    contactId: string
  ): Promise<IConversation | null> => {
    try {
      return await Conversation.findOne({
        contactId,
      })
        .populate("participants")
        .populate("lastMessage");
    } catch (error) {
      throw error;
    }
  },
  fetchConvosBasedOnCursor: async (data: {
    userId: string;
    cursor?: string | null;
    limit: number;
  }) => {
    try {
      const { cursor, limit } = data;

      let conversations: IConversation[];

      if (cursor) {
        conversations = await ConvoService.fetchConvosByCursor({
          ...data,
          cursor,
        });
      } else {
        conversations = await ConvoService.fetchConvosNoCursor(data);
      }

      const hasMore = conversations.length > limit;

      if (hasMore) conversations.pop();

      return {
        hasMore,
        conversations,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetchConvosBasedOnCursor: ${(error as Error).message}`
      );
    }
  },
  fetchConvosByCursor: async (data: {
    userId: string;
    cursor: string;
    limit: number;
  }) => {
    try {
      const { userId, cursor, limit } = data;

      return await Conversation.find({
        participants: userId,
        deletedFor: { $ne: userId },
        lastMessageAt: { $lt: new Date(cursor) },
      })
        .sort({ lastMessageAt: -1 })
        .limit(limit + 1)
        .populate("participants")
        .populate("lastMessage")
        .lean();
    } catch (error) {
      throw new Error(
        `Failed to fetchConvosByCursor: ${(error as Error).message}`
      );
    }
  },
  fetchConvosNoCursor: async (data: {
    userId: string;
    cursor?: string | null;
    limit: number;
  }) => {
    try {
      const { userId, limit } = data;

      return await Conversation.find({
        participants: new mongoose.Types.ObjectId(userId),
        deletedFor: { $ne: new mongoose.Types.ObjectId(userId) }, // filder out convo where the user is in the deletedFor field
        lastMessage: { $ne: null },
      })
        .sort({ lastMessageAt: -1 })
        .limit(limit + 1)
        .populate("participants")
        .populate("lastMessage")
        .lean();
    } catch (error) {
      throw new Error(
        `Failed to fetchConvosNoCursor: ${(error as Error).message}`
      );
    }
  },
  getConvoByContactId: async (contactId: string) => {
    try {
      return await Conversation.findOne({ contactId });
    } catch (error) {
      console.log("Failed to getConvoByContactId", error);
    }
  },

  incrementMessageUnreadOnNotViewConvo: async (
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

      const isRecipentViewingConvo = messageHanlder.isActiveRecipient(
        conversationId,
        recipentId
      );

      if (!isRecipentViewingConvo) {
        await Conversation.updateOne(
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
      }
    } catch (error) {
      throw new Error(
        `Failed to update unread counts: ${(error as Error).message}`
      );
    }
  },
  refreshConversation: async (data: {
    conversation: IConversation;
    userId: string;
  }): Promise<IConversation> => {
    try {
      const { _id: convoId, contactId } = data.conversation;
      const userId = data.userId;

      let conversation = data.conversation;

      const isConvoDeleted = conversation.deletedFor?.includes(
        new mongoose.Types.ObjectId(userId)
      );

      if (isConvoDeleted) {
        conversation.deletedFor = await ConvoService.undeleteConversation(
          contactId.toString(),
          userId
        );
      }
      console.log("Refreshing conversation");

      await ConvoService.setLastMessageOnRead({ conversation, userId });
      await messageService.markReadMessages(convoId as string, userId);
      await ConvoService.resetUnreadCounts({
        convoId: convoId as string,
        userId,
      });

      return conversation;
    } catch (error) {
      throw error;
    }
  },
  resetUnreadCounts: async (payload: { convoId: string; userId: string }) => {
    try {
      const { convoId, userId } = payload;

      // set unread counts to 0 and unread messages to read
      await Conversation.updateOne(
        { _id: convoId, "unreadCounts.user": userId },
        { "unreadCounts.$.count": 0 }
      );
    } catch (error) {
      throw error;
    }
  },
  setLastMessageOnRead: async (payload: {
    conversation: IConversation;
    userId: string;
  }) => {
    try {
      console.log("setLastMessageOnRead".toLocaleUpperCase());
      const { conversation, userId } = payload;
      const { _id: convoId } = payload.conversation;
      const msgId = conversation.lastMessage?._id;

      if (!msgId) {
        console.log("No Message to Read");
        return;
      }

      console.log("Setting message onread");

      // Use aggregation pipeline to check recipient and update in one query
      const result = await Conversation.aggregate([
        {
          $match: { _id: convoId },
        },
        {
          $lookup: {
            from: "messages", // Replace with your actual message collection name
            localField: "lastMessage",
            foreignField: "_id",
            as: "lastMessageDoc",
          },
        },
        {
          $match: {
            "lastMessageDoc.recipient": new mongoose.Types.ObjectId(userId),
          },
        },
      ]);

      // If the user is the recipient, proceed with update
      if (result.length > 0) {
        // First try to update existing entry
        const updateResult = await Conversation.updateOne(
          {
            _id: convoId,
            "lastMessageOnRead.user": new mongoose.Types.ObjectId(userId),
          },
          {
            "lastMessageOnRead.$.message": msgId,
          }
        );

        // If no existing entry, create new one
        if (updateResult.matchedCount === 0) {
          await Conversation.updateOne(
            { _id: convoId },
            {
              $push: {
                lastMessageOnRead: {
                  user: new mongoose.Types.ObjectId(userId),
                  message: msgId,
                },
              },
            }
          );
        }

        console.log("LastMessageOnRead updated successfully");
      } else {
        console.log("User is not the recipient of the last message");
      }
    } catch (error) {
      console.error("Error in setLastMessageOnRead:", error);
      throw error;
    }
  },
  setLatestCovoMessage: async (
    convoId: string,
    messageData: IMessage
  ): Promise<IConversation | null> => {
    try {
      return await Conversation.findByIdAndUpdate(
        { _id: convoId },
        {
          lastMessage: messageData,
          updatedAt: messageData.createdAt,
          lastMessageAt: messageData.createdAt,
        }
      );
    } catch (error) {
      throw new Error(
        `Failed to update unread counts: ${(error as Error).message}`
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
      conversation.deletedFor = deletedFor.filter(
        (id) => id.toString() !== userObjectId.toString()
      );
      await conversation.save();

      return conversation.deletedFor;
    } catch (error) {
      throw error;
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
};

export interface FormattedConversation {
  _id: string; //
  contactId: mongoose.Types.ObjectId;
  participant: IUser | mongoose.Types.ObjectId;
  isUserValidToRply: boolean;
  lastMessage?: IMessage | mongoose.Types.ObjectId;
  lastMessageAt: Date | string;
  unreadCount: number;
  lastMessageOnRead?: mongoose.Types.ObjectId;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export const conversationFormatHelper = {
  formatConversationData: (
    conversation: IConversation,
    userId: string,
    validUser: mongoose.Types.ObjectId[]
  ): FormattedConversation => {
    try {
      // format data for frontend
      const isUserValidToRply = validUser
        .toString()
        .includes(userId.toString());

      const otherParticipant = conversation.participants.find(
        (user) => user._id.toString() !== userId!.toString()
      );

      // for unreadt counts
      const unreadData = conversation.unreadCounts.find(
        (unrd) => unrd.user.toString() === userId!.toString()
      );

      const lastMessageReadByParticipant = conversation.lastMessageOnRead?.find(
        (data) => data.user === otherParticipant
      );

      if (!otherParticipant || !unreadData) {
        throw new Error("Missing format dataa");
      }

      return {
        _id: conversation._id as string,
        contactId: conversation.contactId,
        participant: otherParticipant,
        isUserValidToRply,
        lastMessage: conversation?.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount: unreadData ? unreadData.count : 0,
        lastMessageOnRead: lastMessageReadByParticipant?.message,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      };
    } catch (error) {
      throw error;
    }
  },

  formatConversationArray: (conversations: IConversation[], userId: string) => {
    console.log("COnversation to be formatedd: ", conversations);

    const formatedData = conversations.map((convo) => {
      const otherParticipant = convo.participants.find(
        (user) => user._id.toString() !== userId!.toString()
      );

      const unreadData = convo.unreadCounts.find(
        (unread) => unread.user._id.toString() === userId!.toString()
      );

      const lastMessageReadByParticipant = convo.lastMessageOnRead?.find(
        (data) => data.user.toString() === otherParticipant?._id.toString()
      );

      const isUserValidToRply = convo.validFor
        .toString()
        .includes(userId.toString());

      return {
        _id: convo._id,
        contactId: convo.contactId,
        participant: otherParticipant,
        isUserValidToRply,
        lastMessage: convo.lastMessage,
        lastMessageAt: convo.lastMessageAt,
        unreadCount: unreadData ? unreadData.count : 0,
        lastMessageOnRead: lastMessageReadByParticipant?.message,
        createdAt: convo.createdAt,
        updatedAt: convo.updatedAt,
      };
    });

    console.log("Conversations: ", formatedData);

    return formatedData;
  },
};
