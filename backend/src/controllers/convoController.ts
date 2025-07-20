import { Request, Response } from "express";
import { Conversation, IConversation } from "../models/conversationModel";
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
    const payload = ConvoService.buildViewPayload(req);
    const { userId, contactId } = payload;

    let conversation = await ConvoService.findOneByContactIdPopulate(contactId);
    const validUser = await contactService.validUsers(contactId);

    if (!validUser || !userId) {
      return res.json({
        success: false,
        message: "Failed to open convo, no userId or valid user",
      });
    }

    if (!conversation) {
      const createPayload = { ...payload, validUser };

      conversation = await ConvoService.createConversation(createPayload);
    } else {
      conversation = await ConvoService.refreshConversation({
        conversation,
        userId,
      });
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

export const findOne = async (req: ReqAuth, res: Response) => {
  try {
    const userId = req.userId;
    const { convoId } = req.body;

    const conversation = await ConvoService.getConvoById(convoId);

    console.log("Conversation for client update: ", conversation);

    const formattedData = conversationFormatHelper.formatConversationData(
      conversation!,
      userId!,
      conversation?.validFor!
    );

    res.json({
      success: true,
      message: "conversations found",
      conversations: formattedData,
    });
  } catch (error) {
    console.log("Failed to getConversation, " + error);
    res.json({ success: false, message: "Error" + error });
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

    // add user in deleteFor(filter field)
    conversation.deletedFor.push(new mongoose.Types.ObjectId(userId));

    // check if both particapants is in deletedFor.
    const isPermanent = conversation.deletedFor.length === 2;

    const { success } = await messageService.deleteMessages(
      isPermanent,
      convoId,
      userId
    );

    // permanently delete convo if  both participant deleted it
    if (isPermanent) {
      await Conversation.deleteOne({ _id: convoId });

      return res.json({
        success: true,
        message: `permanently deleted conversation, delete for messages is  ${success}`,
        conversations: conversation,
      });
    }

    await conversation.save();
    await ConvoService.resetUnreadCounts({
      convoId: conversation._id!.toString(),
      userId,
    });

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
