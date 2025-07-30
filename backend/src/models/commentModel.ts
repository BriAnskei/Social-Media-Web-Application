import mongoose, { Document, model, Schema } from "mongoose";

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", require: true },
  content: { type: String, require: true },
  createdAt: { type: Date, default: Date.now },
});

// index by posyId
commentSchema.index({ postId: 1, createdAt: -1 });

const CommentModel = model<IComment>("Comment", commentSchema);
export default CommentModel;
