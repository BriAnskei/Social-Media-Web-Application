import { Request, Response } from "express";
import { Conversation } from "../models/conversationModel";
import mongoose, { ObjectId } from "mongoose";
import { messageService } from "../services/message.service";

import {
  conversationFormatHelper,
  ConvoService,
} from "../services/conversation.service";
import { contactService } from "../services/contact.service";
1;
interface ReqAuth extends Request {
  userId?: string;
}

export const findOrCreateConversation = async (
  req: ReqAuth,
  res: Response
): Promise<any> => {
  try {
    const userId = req.userId;
    const otherUser = req.body.otherUser;
    const { contactId } = req.params;

    let conversation = await Conversation.findOne({
      contactId,
    })
      .populate("participants")
      .populate("lastMessage");
    const validUser = await contactService.validUsers(contactId);

    if (!validUser || !userId) {
      throw new Error(
        "Failed  on 'openOrUpdateConvo'. UserId is undifined or there is no valid user for this conversation"
      );
    }

    if (!conversation) {
      conversation = await Conversation.create({
        contactId,
        validFor: validUser,
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
      const isDeleted = conversation.deletedFor?.includes(
        new mongoose.Types.ObjectId(userId)
      );

      console.log("Conversation founmd: ", conversation);

      if (isDeleted) {
        conversation.deletedFor = await ConvoService.undeleteConversation(
          contactId,
          userId
        );
      }

      console.log(
        "Convo exist, removing user in delete for",
        isDeleted,
        "convo nod: ",
        conversation
      );

      // set unread counts to 0 and unread messages to read
      await Conversation.updateOne(
        { _id: conversation._id, "unreadCounts.user": userId },
        { "unreadCounts.$.count": 0 }
      );

      await messageService.markReadMessages(conversation._id as string, userId);
    }

    const formatedData = conversationFormatHelper.formatConversationData(
      conversation!,
      userId,
      validUser
    );

    res.json({
      success: true,
      message: "conversation find",
      conversations: formatedData,
    });
  } catch (error) {
    console.log("Failed to find conversation, " + error);
    res.json({ success: false, message: "Error" });
  }
};

export const getConversations = async (
  req: ReqAuth,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req;

    const { page = 1, limit = 20 } = req.query;

    if (!userId) throw new Error("Id is required to fetch conversation");

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum; // no skip at page one
    // we will fetch this using pagination method

    // Find all conversation where user is a participant
    const conversations = await Conversation.find({
      participants: userId,
      deletedFor: { $ne: userId }, // filder out convo where the user is in the deletedFor field
      lastMessage: { $ne: null },
    })
      .sort({ lastMessaageAt: -1 }) // sort from the latest(decending)
      .skip(skip)
      .limit(limitNum)
      .populate("participants")
      .populate("lastMessage")
      .lean();

    // Format data
    const formatedData = conversationFormatHelper.formatConversationArray(
      conversations,
      userId
    );

    // Total documents for pagimation
    const total = await Conversation.countDocuments({
      participants: userId,
      deletedFor: { $ne: userId },
    });
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

    if (!userId || !convoId)
      throw new Error("no user id or conversation id recieved");

    const conversation = await Conversation.findById(convoId);

    if (!conversation) {
      return res.json({ success: false, message: "conversation not exist" });
    }

    // add user in deleteFor(filter field)
    conversation.deletedFor.push(new mongoose.Types.ObjectId(userId));

    // check if both particapants is in deletedFor.
    const isPermanent = conversation.deletedFor.length === 2;
    const { success } = await messageService.deleteMessages(
      isPermanent,
      convoId,
      userId
    );

    // permanent delete if deletedBoth, soft delete otherwise(save the update)
    if (isPermanent) {
      await Conversation.deleteOne({ _id: convoId });
    } else {
      await conversation.save();
    }

    res.json({
      success: true,
      message: `deleted for this user, delete for messages is  ${success}`,
      conversations: conversation,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
