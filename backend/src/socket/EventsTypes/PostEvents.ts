import { Types } from "mongoose";
import { INotification } from "../../models/notificationModel";
import { IPost } from "../../models/postModel";
import { IUser } from "../../models/userModel";

// interface payload
export interface IUserPayload {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  password: string;
  profilePicture?: string;
  bio?: string;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  createdAt: Date;
}

export interface LikeEventPayload {
  postId: string;
  postOwnerId: string;
  userId: string;
  notifData:
    | {
        isExist: boolean;
        data: INotification;
      }
    | undefined;
}

export interface CommentEventPayload {
  postId: string;
  postOwnerId: string; // needed this field for the socket-to valide commenter
  data: {
    user: IUserPayload;
    content: string;
    createdAt: Date;
  };
}

// event for notifying followers when upload
export interface PostUploadNotifEvent {
  userId: string;
  postId: string;
}

export interface PostUpdateEvent {
  data: IPost;
}
