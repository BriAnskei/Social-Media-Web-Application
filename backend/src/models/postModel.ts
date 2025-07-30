import mongoose, { Schema, Document, Model, Types, model } from "mongoose";

export interface IComment {
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  image?: string;
  likes: mongoose.Types.ObjectId[];
  createdAt?: Date;
}

const postSchema = new Schema<IPost>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
  content: { type: String, require: true },
  image: { type: String, default: "" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

// well emplement a  Virtual Field, to count the total comments
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
  count: true,
});

// Enable virtuals in output
postSchema.set("toObject", { virtuals: true });
postSchema.set("toJSON", { virtuals: true });

const postModel = model<IPost>("Post", postSchema);
export default postModel;
