import mongoose, { Document, Schema } from "mongoose";

interface IContact extends Document {
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export const Contact = mongoose.model<IContact>("Contact", ContactSchema);

// https://claude.ai/chat/a4c4649e-cab0-4d47-b5b7-5502157d7811
