import { Request, Response } from "express";
import { MessageModel } from "../models/messageModel";

import { messageService } from "../services/message.service";
import { UserChatRelationService } from "../services/UserChatRelation.service";
import { ConvoService } from "../services/conversation.service";

export interface ReqAuth extends Request {
  userId?: string;
}

export const addMessage = async (req: ReqAuth, res: Response): Promise<any> => {
  try {
    const { messagePayload, convoId } =
      messageService.createPayloadForActiveRecipient(req);

    const response = await messageService.createMessageAndUpdateConvo(
      messagePayload,
      convoId
    );

    const { message, conversation } = response;

    const isMsgReadByRecipient = message.read;

    // if (isMsgReadByRecipient) {
    //   await UserChatRelationService.updateConvoMsgReadOnSend({
    //     conversation,
    //     userId: message.recipient.toString(),
    //   });
    // } else {
    //   await ConvoService.incrementMessageUnreadOnNotViewConvo(
    //     convoId,
    //     message.recipient.toString(),
    //     message._id as string
    //   );
    // }

    if (!isMsgReadByRecipient) {
      await ConvoService.incrementMessageUnreadOnNotViewConvo(
        convoId,
        message.recipient.toString(),
        message._id as string
      );
    }

    res.json({ success: true, message: "message sent", messages: message });
  } catch (error) {
    console.error("Failed to sent message, " + error);
    res.json({
      success: false,
      message: `Failed to  send message: ${(error as Error).message}`,
    });
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
