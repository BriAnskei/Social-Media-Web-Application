import mongoose, { Document, Schema } from "mongoose";

interface IContact extends Document {
  owner: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ContactSchema.index({ user: 1 }); // index by decnding

export const Contact = mongoose.model<IContact>("Contact", ContactSchema);
