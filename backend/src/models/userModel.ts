import { Schema, model, Document, Types } from "mongoose";

// Interface for User document
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  fullName: string;
  email: string;
  password: string;
  profilePicture: string;
  bio?: string;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  createdAt: Date;
}

// Schema definition
const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  profilePicture: { type: String, default: "" }, // URL to profile picture
  bio: { type: String, maxLength: 160 }, // Optional bio
  followers: [{ type: Schema.Types.ObjectId, ref: "User" }], // Followers
  following: [{ type: Schema.Types.ObjectId, ref: "User" }], // Following
  createdAt: { type: Date, default: Date.now },
});

// Create and export the model
const UserModel = model<IUser>("User", userSchema);

export default UserModel;
