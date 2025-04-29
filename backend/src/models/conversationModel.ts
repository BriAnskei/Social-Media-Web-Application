import mongoose, { Schema, Document, Model, Types, model } from "mongoose";
import { IMessage } from "./messageModel";
import MessageSchema from "./messageModel";

export interface IConversation {
  users: Types.ObjectId[];
  messages: [IMessage];
  lastMessage: IMessage;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Conversation Schema
const ConversationSchema = new Schema<IConversation>(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messages: [MessageSchema],
    lastMessage: {
      type: MessageSchema,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const conversationModel = model<IConversation>("chats", ConversationSchema);
export default conversationModel;
