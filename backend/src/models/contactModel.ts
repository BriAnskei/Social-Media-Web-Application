import mongoose, { Document, Schema } from "mongoose";

interface IContact extends Document {
  user: mongoose.Types.ObjectId[];
  validFor: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>({
  user: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  validFor: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

ContactSchema.index({ user: 1 }); // index by decnding

export const Contact = mongoose.model<IContact>("Contact", ContactSchema);
