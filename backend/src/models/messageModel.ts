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
  attachments: IAttachment[];
  hideFrom: mongoose.Types.ObjectId;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
}

// Sub schema
const AttachmentSchema = new Schema<IAttachment>(
  {
    type: {
      type: String,
      enum: ["image"], // valid file to attach
      required: function (this: IAttachment) {
        return !!this; // Required if attachment exists
      },
    },
    url: {
      type: String,
      required: function (this: IAttachment) {
        return !!this; // Required if attachment exists
      },
    },
    fileName: String,
    fileSize: Number,
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
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
      required: true,
      trim: true,
    },
    attachments: [AttachmentSchema],
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
  },
  { timestamps: true } // automaticaly adds the date fields
);

// Index for quick lookup of messages in a conversation
MessageSchema.index({ conversationId: 1, createdAt: -1 });

// Index for finding unread messages for a user
MessageSchema.index({ recipient: 1, read: 1 });

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
