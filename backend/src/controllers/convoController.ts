import { Request, Response } from "express";
import { Conversation } from "../models/conversationModel";
import mongoose from "mongoose";

interface ReqAuth extends Request {
  userId?: string;
}

export const findOrCreateConvo = async (
  req: ReqAuth,
  res: Response
): Promise<any> => {
  try {
    const userId = req.userId;
    const otherUser = req.body;
    const contactId = req.params;

    let conversation = await Conversation.findOne({ contactId })
      .populate("participants")
      .populate("lastMessage");
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, otherUser],
        unreadCounts: [
          {
            user: userId,
            count: 0,
          },
          { user: otherUser, count: 0 },
        ],
      });

      conversation = await Conversation.findById(conversation._id).populate(
        "participants"
      );
    } else {
      // here if the conversation exist, but user existed in deletedFor(prevously deleted this convo)
      // we might want to pull it in the deletedFor array. Lets say the user want to start a convo agin
      const isDeleted = conversation.deletedFor.includes(
        new mongoose.Types.ObjectId(userId)
      );

      if (isDeleted) {
        const convoId = conversation._id;
        await Conversation.updateOne(
          { _id: convoId },
          { $pull: { deletedFor: { $sin: [userId] } } }
        );
      }
    }

    // format data for frontend
    const otherParticipant = conversation!.participants.find(
      (user) => user._id.toString() !== userId!.toString()
    );

    // for unreadt counts
    const unreadData = conversation!.unreadCounts.find(
      (unrd) => unrd.user.toString() === userId!.toString()
    );

    const foramtedData = {
      _id: conversation!._id,
      otherUser: otherParticipant,
      lastMessage: conversation?.lastMessage,
      unreadCount: unreadData ? unreadData.count : 0,
    };

    res.json({
      success: true,
      message: "conversation find",
      conversations: foramtedData,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export const getConversations = async (
  req: ReqAuth,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req;
    // default values
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum; // no skip at page one
    // we will fetch this using pagination method

    // Find all conversation where user is a participant
    const conversations = await Conversation.find({
      participants: userId,
      deletedFor: { $en: userId },
    })
      .sort({ lastMessaageAt: -1 }) // sort from the latest(decending)
      .skip(skip)
      .limit(limitNum)
      .populate("participants")
      .populate("lastMessage")
      .lean();

    // Format data
    const formatedData = conversations.map((convo) => {
      const otherParticipants = convo.participants.find(
        (user) => user._id.toString() !== userId!.toString()
      );

      const unreadData = convo.unreadCounts.find(
        (unread) => unread.user._id.toString() === userId!.toString()
      );

      return {
        _id: convo._id,
        otherUser: otherParticipants,
        lastMessage: convo.lastMessage,
        lastMessageAt: convo.lastMessageAt,
        unreadCount: unreadData ? unreadData.count : 0,
        updatedAt: convo.updatedAt,
      };
    });

    // Total documents for pagimation
    const total = await Conversation.countDocuments({ participants: userId });
    res.json({
      success: true,
      message: "conversations find",
      conversations: formatedData,
      pagimation: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export const deleteConversation = async (
  req: ReqAuth,
  res: Response
): Promise<any> => {
  try {
    const userId = req.userId;
    const { convoId } = req.body;

    const conversation = await Conversation.findById(convoId);

    if (!conversation) {
      return res.json({ success: false, message: "conversation not exist" });
    }

    // add user in deleteFor(filter field)
    conversation.deletedFor.push(new mongoose.Types.ObjectId(userId));

    // check if both particapants is in deletedFor.
    let user1Deleted = false;
    let user2Deleted = false;
    const participants = conversation.participants;
    conversation.deletedFor.forEach((user) => {
      if (participants.includes(user)) {
        if (!user1Deleted) {
          user1Deleted = true;
        } else {
          user2Deleted = true;
        }
      }
    });

    const isDeletedByBoth = user1Deleted && user2Deleted;
    // here we deleted the conversation and messages permanently
    if (isDeletedByBoth) {
      await Conversation.deleteOne({ _id: convoId });
    }

    res.json({
      success: true,
      message: "deleted for this user",
      conversations: conversation,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
