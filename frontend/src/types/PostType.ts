import { ApiResponse } from "./ApiResponseType";
import { FetchedUserType } from "./user";

export interface CommentType {
  user: FetchedUserType;
  postId: string;
  content: string;
  createdAt: string;
}

export interface FetchPostType {
  _id: string;
  user: string | FetchedUserType;
  content: string;
  image?: string | File;
  likes: string[];
  totalComments: number;
  createdAt: string;
}

export interface CommentApiResponse extends ApiResponse {
  commentData?: CommentType;
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
  data: CommentType;
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
