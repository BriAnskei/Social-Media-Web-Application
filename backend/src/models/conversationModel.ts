import mongoose, { Document, Schema } from "mongoose";

interface ParticipantOnRead {
  user: mongoose.Types.ObjectId;
  message: mongoose.Types.ObjectId;
}

export interface IUnreadCount {
  user: mongoose.Types.ObjectId;
  count: number;
}

export interface IConversation extends Document {
  contactId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  deletedFor: mongoose.Types.ObjectId[];
  validFor: mongoose.Types.ObjectId[]; // user who can rply
  lastMessage?: mongoose.Types.ObjectId; // user who message
  unreadCounts: IUnreadCount[];
  lastMessageAt: Date;
  lastMessageOnRead?: ParticipantOnRead[];
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantOnReadSchema = new Schema<ParticipantOnRead>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { _id: false }
);

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
    deletedFor: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    validFor: [
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
    lastMessageOnRead: [ParticipantOnReadSchema],
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
