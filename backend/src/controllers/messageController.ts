import { Request, Response } from "express";
import { MessageModel } from "../models/messageModel";
import { ConvoService } from "../services/conversation.service";

interface ReqAuth extends Request {
  userId?: string;
}

export const addMessage = async (req: ReqAuth, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;
    const { recipient, content, createdAt } = req.body;

    const message = await MessageModel.create({
      conversationId,
      sender: userId,
      recipient,
      content,
      createdAt: new Date(createdAt),
      attachments: req.file?.filename,
    });

    await ConvoService.increamentUnread(
      conversationId,
      recipient,
      message._id as string
    );

    res.json({ success: true, message: "message sent", messages: message });
  } catch (error) {
    console.log("Failed to sent message, " + error);
    res.json({ success: false, message: "Error" });
  }
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
        .limit(limit + 1);
    } else {
      messages = await MessageModel.find({
        conversationId,
        hideFrom: { $ne: userId },
      })
        .sort({ createdAt: -1 })
        .limit(limit + 1);
    }

    const hasMore = messages.length > limit;

    console.log("FETCHED: ", hasMore, messages, messages.length, limit);

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
