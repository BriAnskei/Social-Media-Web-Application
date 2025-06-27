import mongoose from "mongoose";
import { ReqAuth } from "../controllers/messageController";

export interface IMessageInput {
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  recipient: string;
  content: string;
  attachments: string | undefined;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

export const buildMessagePayload = (
  req: ReqAuth,
  isActiveRecipient: boolean
): IMessageInput => {
  const userId = req.userId;
  const { conversationId } = req.params;
  const { recipient, content, createdAt } = req.body;

  return {
    conversationId: new mongoose.Types.ObjectId(conversationId),
    sender: new mongoose.Types.ObjectId(userId),
    recipient,
    content,
    attachments: req.file?.filename,
    read: isActiveRecipient,
    ...(isActiveRecipient && { readAt: new Date() }),
    createdAt: new Date(createdAt),
  };
};
