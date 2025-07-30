import { ApiResponse } from "./ApiResponseType";
import { FetchedUserType } from "./user";

export interface CommentType {
  user: FetchedUserType;
  content: string;
  createdAt: Date;
}

export interface FetchPostType {
  _id: string;
  user: string | FetchedUserType;
  content: string;
  image?: string | File;
  likes: string[];
  comments: CommentType[];
  hasMoreComments: boolean;
  totalComments: number;
  createdAt: string;
}

export interface FetchCommentApiResponse {
  commentRes?: {
    commentToReturn: CommentType[];
    hasMore: boolean;
    nextCursor: string;
  };
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
