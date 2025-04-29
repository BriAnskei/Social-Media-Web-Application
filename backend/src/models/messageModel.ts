import mongoose, { Schema, Document, Model, Types, model } from "mongoose";

export interface IMessage {
  sender: Types.ObjectId;
  content: string;
  readBy: Types.ObjectId[];
  attachments: string[];
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  readBy: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  attachments: [
    {
      type: String, // URLs to media files
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default MessageSchema;
