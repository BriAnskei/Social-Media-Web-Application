import mongoose, { Schema, Document, Model, Types, model } from "mongoose";

interface Comment {
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  image?: string;
  likes: mongoose.Types.ObjectId[];
  comments: Comment[];
  createdAt?: Date;
}

const postSchema = new Schema<IPost>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
  content: { type: String, require: true },
  image: { type: String, default: "" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const postModel = model<IPost>("Post", postSchema);
export default postModel;
