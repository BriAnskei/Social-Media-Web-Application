import { Request, Response } from "express";
import { Conversation } from "../models/conversationModel";
import mongoose, { ObjectId } from "mongoose";
import { messageService } from "../services/message.service";

import {
  conversationFormatHelper,
  ConvoService,
} from "../services/conversation.service";
import { contactService } from "../services/contact.service";

export interface ReqAuth extends Request {
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

      if (isDeleted) {
        conversation.deletedFor = await ConvoService.undeleteConversation(
          contactId,
          userId
        );
      }

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
    const userConvoPayload = ConvoService.buildPayloadForFetchingConvo(req);

    const response = await ConvoService.fetchConvosBasedOnCursor(
      userConvoPayload
    );
    const { conversations, hasMore } = response;

    const formattedConvoDatas =
      conversationFormatHelper.formatConversationArray(
        conversations,
        userConvoPayload.userId
      );

    res.json({
      success: true,
      message: "conversations fetched",
      conversations: formattedConvoDatas,
      hasMore,
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
    const convoId = req.body.conversationId;

    if (!userId || !convoId)
      throw new Error("no user id or conversation id recieved");

    const conversation = await Conversation.findById(convoId);

    if (!conversation) {
      return res.json({ success: false, message: "conversation not exist" });
    }

    console.log("Deleting this conversation: ", conversation);

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
