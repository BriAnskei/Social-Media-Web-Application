import { INotification } from "../../models/notificationModel";
import { IPost } from "../../models/postModel";

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
  postOwnerId: string;
  data: {
    user: string;
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
