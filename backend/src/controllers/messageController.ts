import { Request, Response } from "express";
import { MessageModel } from "../models/messageModel";

import { messageService, requesHanlder } from "../services/message.service";
import { UserChatRelationService } from "../services/UserChatRelation.service";
import { ConvoService } from "../services/conversation.service";
import { messageQueue } from "../queues/messageQueues";

export interface ReqAuth extends Request {
  userId?: string;
}

export const addMessage = async (req: ReqAuth, res: Response) => {
  const payload = requesHanlder.createPayloadForActiveRecipient(req);

  await messageQueue.add("sendMessage", payload, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 100, // Keep only last 100 completed jobs
    removeOnFail: 50,
  });
  res.status(202).json({ status: "Message queued" });
};

export const getMessages = async (
  req: ReqAuth,
  res: Response
): Promise<any> => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;
    const { cursor, limit = 7 } = req.body;

    let messages;

    if (cursor) {
      messages = await MessageModel.find({
        conversationId,
        hideFrom: { $ne: userId },
        createdAt: { $lt: new Date(cursor) },
      })
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .lean();
    } else {
      messages = await MessageModel.find({
        conversationId,
        hideFrom: { $ne: userId },
      })
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .lean();
    }

    const hasMore = messages.length > limit;

    if (hasMore) messages.pop();

    res.json({
      success: true,
      message: "Messages fetched",
      messages,
      hasMore,
    });
  } catch (error) {
    console.log("Failed to fetch messages, " + error);
    res.json({ success: false, message: "Error" });
  }
};
