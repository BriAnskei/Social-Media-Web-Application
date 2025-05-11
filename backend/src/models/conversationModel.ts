import mongoose, { Document, Schema } from "mongoose";

export interface IUnreadCount {
  user: mongoose.Types.ObjectId;
  count: number;
}

export interface IConversation extends Document {
  contactId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId; // user who message
  lastMessageAt: Date;
  unreadCounts: IUnreadCount[];
  deletedFor: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Sub schema fo the converttion model
const UnreadCountSchema = new Schema<IUnreadCount>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  { _id: false } // prevent for adding Id
);

const ConversationSchema = new Schema<IConversation>(
  {
    contactId: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCounts: [UnreadCountSchema],
  },
  { timestamps: true }
);

// Index for quick lookup of conversations by participant
ConversationSchema.index({ participants: 1 });
// coumpond index for the participants in ascending order

// Index for sorting conversations by most recent message
ConversationSchema.index({ lastMessageAt: -1 });
// coumpond index for the participants in descending order

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);
