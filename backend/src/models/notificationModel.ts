import mongoose, { Document, model, Schema } from "mongoose";

interface INotification extends Document {
  receiver: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const notificationModel = model<INotification>(
  "Notification",
  notificationSchema
);
export default notificationModel;
