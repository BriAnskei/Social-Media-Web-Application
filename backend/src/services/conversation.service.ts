import mongoose from "mongoose";
import { Conversation, IConversation } from "../models/conversationModel";
import { messageService } from "./message.service";
import { IMessage } from "../models/messageModel";
import { ReqAuth, searchConversation } from "../controllers/convoController";
import { IUser } from "../models/userModel";
import { messageHanlder } from "../server";
import { errThrower } from "./errHandler";

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
      throw new Error("buildViewPayload" + (error as Error));
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
        lastMessageOnRead: [
          { user: new mongoose.Types.ObjectId(userId), message: undefined },
          { user: new mongoose.Types.ObjectId(otherUser), message: undefined },
        ],
      });
      return await (
        await conversation.populate("participants")
      ).populate("lastMessage");
    } catch (error) {
      throw new Error("createConversation" + (error as Error));
    }
  },
  deleteConvoByContactId: async (contactId: string) => {
    try {
      await Conversation.deleteOne({ contactId });
    } catch (error) {
      console.log("Failed to deleteConvoByContactId, ", error);
    }
  },
  deleteConvoById: async (convoId: string) => {
    try {
      await Conversation.deleteOne({ _id: convoId });
    } catch (error) {
      throw error;
    }
  },
  findOneByContactIdPopulate: async (payLoad: {
    contactId: string;
    userId: string;
  }): Promise<IConversation | null> => {
    try {
      const { contactId, userId } = payLoad;

      const conversation = await Conversation.findOne({
        contactId,
      })
        .populate(
          "participants",
          "username fullName email profilePicture followers following"
        )
        .populate("lastMessage")
        .lean();

      if (!conversation) {
        return null;
      }

      const lastMessage = conversation.lastMessage as IMessage;

      if (lastMessage) {
        const hideFrom = lastMessage.hideFrom;
        if (hideFrom && hideFrom.toString() === userId.toString()) {
          conversation.lastMessage = undefined;
        }
      }

      return conversation;
    } catch (error) {
      throw new Error("findOneByContactIdPopulate" + (error as Error));
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

      return await Conversation.aggregate([
        {
          $match: {
            participants: new mongoose.Types.ObjectId(userId),
            deletedFor: { $ne: new mongoose.Types.ObjectId(userId) },
            lastMessageAt: { $lt: new Date(cursor) },
            lastMessage: { $ne: null },
          },
        },
        {
          $lookup: {
            from: "messages", // collection name (usually pluralized)
            localField: "lastMessage",
            foreignField: "_id",
            as: "lastMessageData",
          },
        },
        {
          $match: {
            $or: [
              {
                "lastMessageData.hideFrom": {
                  $ne: new mongoose.Types.ObjectId(userId),
                },
              },
              { "lastMessageData.hideFrom": { $exists: false } },
              { "lastMessageData.hideFrom": null },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "participants",
            foreignField: "_id",
            as: "participants",
          },
        },
        {
          $addFields: {
            lastMessage: { $arrayElemAt: ["$lastMessageData", 0] },
          },
        },
        {
          $project: {
            lastMessageData: 0, // Remove the temporary field
          },
        },
        {
          $sort: { lastMessageAt: -1 },
        },
        {
          $limit: limit + 1,
        },
      ]);
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

      const conversation = await Conversation.aggregate([
        {
          $match: {
            participants: new mongoose.Types.ObjectId(userId),
            deletedFor: { $ne: new mongoose.Types.ObjectId(userId) },
            lastMessage: { $ne: null },
          },
        },
        {
          $lookup: {
            from: "messages",
            localField: "lastMessage",
            foreignField: "_id",
            as: "lastMessageData",
          },
        },
        {
          $match: {
            $or: [
              {
                "lastMessageData.hideFrom": {
                  $ne: new mongoose.Types.ObjectId(userId),
                },
              },
              { "lastMessageData.hideFrom": { $exists: false } },
              { "lastMessageData.hideFrom": null },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "participants",
            foreignField: "_id",
            as: "participants",
          },
        },
        {
          $addFields: {
            lastMessage: { $arrayElemAt: ["$lastMessageData", 0] },
          },
        },
        {
          $project: {
            lastMessageData: 0,
          },
        },
        {
          $sort: { lastMessageAt: -1 },
        },
        {
          $limit: limit + 1,
        },
      ]);

      return conversation;
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
  getConvoById: async (convId: string): Promise<IConversation | null> => {
    try {
      const convo = await Conversation.findOne({ _id: convId })
        .populate("lastMessage")
        .populate("participants");

      return convo;
    } catch (error) {
      throw new Error("getConvoById, " + (error as Error));
    }
  },
  isConvoValid: (conversation: IConversation) => {
    return Boolean(conversation.lastMessage);
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
    } catch (error) {
      throw new Error(
        `Failed to update unread counts: ${(error as Error).message}`
      );
    }
  },

  removeUsersFromDeleted: async (convoId: string) => {
    try {
      await Conversation.updateOne(
        { _id: convoId },
        { $set: { deletedFor: [] } }
      );
    } catch (error) {
      throw new Error("removeUsersFromDeleted, " + (error as Error));
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
      } else {
        await messageService.markReadMessages(convoId as string, userId);
        await ConvoService.resetUnreadCounts({
          convoId: convoId as string,
          userId,
        });
        await ConvoService.setLastMessageOnRead({ conversation, userId });
      }

      return conversation;
    } catch (error) {
      throw new Error("refreshConversation" + (error as Error));
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
      throw new Error("resetUnreadCounts, " + (error as Error).message);
    }
  },
  setLastMessageOnRead: async (payload: {
    conversation: IConversation;
    userId: string;
  }): Promise<void> => {
    try {
      const { conversation, userId } = payload;
      const { _id: convoId } = payload.conversation;
      const msg = conversation.lastMessage as IMessage;

      if (!msg) {
        return;
      }

      const userRead = conversation.lastMessageOnRead?.find(
        (rd) => rd.user.toString() === userId
      );

      if (userRead && userRead.message === msg._id) {
        return; // do nothing if it is already setted
      }

      if (msg && msg.recipient.toString() === userId.toString()) {
        await Conversation.updateOne(
          { _id: convoId, "lastMessageOnRead.user": userId },
          {
            "lastMessageOnRead.$.message": msg._id,
          }
        );
      }
    } catch (error) {
      throw new Error("setLastMessageOnRead, " + (error as Error));
    }
  },

  setLatestCovoMessage: async (payload: {
    newMessage: IMessage;
    convoId: string;
  }): Promise<IConversation | null> => {
    const { convoId, newMessage } = payload;
    try {
      return await Conversation.findByIdAndUpdate(
        { _id: convoId },
        {
          lastMessage: newMessage,
          updatedAt: newMessage.createdAt,
          lastMessageAt: newMessage.createdAt,
        },
        { new: true }
      ).populate("lastMessage");
    } catch (error) {
      throw new Error(`setLatestCovoMessage,  ${(error as Error).message}`);
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
  updateConversationOnMessageSent: async (payload: {
    newMessage: IMessage;
    convoId: string;
  }): Promise<IConversation> => {
    try {
      await ConvoService.removeUsersFromDeleted(payload.convoId);
      const updatedConversation = await ConvoService.setLatestCovoMessage(
        payload
      );
      return updatedConversation!;
    } catch (error) {
      throw new Error("updateConversationOnMessageSent, " + (error as Error));
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

  validateConvoOnDrop: async (convoId: string) => {
    const conversation = await ConvoService.getConvoById(convoId);

    if (!ConvoService.isConvoValid(conversation!)) {
      ConvoService.deleteConvoById(conversation!._id as string);
    }
  },
  searchConvoByParticipant: async (
    participant: [string, string]
  ): Promise<IConversation | null | undefined> => {
    try {
      const [user1, user2] = participant;
      return await Conversation.findOne({
        $and: [{ participants: user1 }, { participants: user2 }],
      }).lean();
    } catch (error) {
      errThrower("searchConvoByParticipant", error as Error);
    }
  },
  getUniqueConversations: async (payload: {
    userId: string;
    users: IUser[];
  }): Promise<IConversation[]> => {
    try {
      const { userId, users } = payload;
      const convoUniqueIDs = new Set<string>();
      const conversationResult: IConversation[] = [];

      for (let user of users) {
        const otherUser = user._id.toString();
        const conversation = await ConvoService.searchConvoByParticipant([
          userId,
          otherUser,
        ]);
        if (conversation) {
          const convoId = conversation._id!.toString();

          if (!convoUniqueIDs.has(convoId)) {
            conversationResult.push(conversation);
          }
          convoUniqueIDs.add(convoId);
        }
      }
      return conversationResult;
    } catch (error) {
      errThrower("getUniqueConversations", error as Error);
      return [];
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
    const formatedData = conversations.map((convo) => {
      const otherParticipant = convo.participants.find(
        (user) => user._id.toString() !== userId!.toString()
      );

      const unreadData = convo.unreadCounts.find(
        (unread) => unread.user._id.toString() === userId.toString()
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
        lastMessage: convo.lastMessage as IMessage,
        lastMessageAt: convo.lastMessageAt,
        unreadCount: unreadData ? unreadData.count : 0,
        lastMessageOnRead: lastMessageReadByParticipant?.message,
        createdAt: convo.createdAt,
        updatedAt: convo.updatedAt,
      };
    });

    return formatedData;
  },
};
