import mongoose, { Document, model, Schema, Types } from "mongoose";

export interface INotification extends Document {
  _id: Types.ObjectId;
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
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: function () {
      return ["like", "comment"].includes(this.type); // only requierd if one of this array element matches the type
    },
  },
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
