import { ApiResponse } from "./ApiResponseType";
import { FetchedUserType } from "./user";

export interface FetchPostType {
  _id: string;
  user: string | FetchedUserType;
  content: string;
  image?: string | File;
  likes: string[];
  comments: {
    user: string | FetchedUserType;
    content: string;
    createdAt: string;
  }[];
  hasMorComments: boolean;
  createdAt: string;
}

export interface CommentApiResponse extends ApiResponse {
  commentData?: {
    user: string;
    content: string;
    createdAt: string;
  };
}

// Uploading posts
export interface UploadPostTypes {
  content: string;
  image?: File;
}

// Payload for like event(socket)
export interface LikeHandlerTypes {
  postId: string;
  userId: string; // sender
}

// Comment event payload
// Client side
export interface CommentEventPayload {
  postId: string;
  postOwnerId?: string;
  data: {
    user: string;
    content: string;
    createdAt?: string;
  };
}
// Server Side
export interface CommentEventRes {
  receiver: string;
  sender: string;
  post: string;
  message: string;
  type: string;
  createdAt?: string;
}
