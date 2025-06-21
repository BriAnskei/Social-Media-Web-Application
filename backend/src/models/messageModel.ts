import mongoose, { Document, Schema } from "mongoose";

// Define interfaces for type safety
export interface IAttachment {
  type: "image" | "video" | "document" | "audio";
  url: string;
  fileName?: string;
  fileSize?: number;
}

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
  attachments: string;
  hideFrom: mongoose.Types.ObjectId;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    trim: true,
    required: function () {
      return !!this.content;
    },
  },
  createdAt: {
    type: Date,
    required: true,
  },
  attachments: {
    type: String,
    required: function () {
      return !!this.attachments;
    },
  },
  hideFrom: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    default: null,
  },
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
});

// Index for quick lookup of messages in a conversation
MessageSchema.index({ conversationId: 1, createdAt: -1 });

// Index for finding unread messages for a user
MessageSchema.index({ recipient: 1, read: 1 });

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
