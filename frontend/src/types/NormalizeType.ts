import { Message } from "./MessengerTypes";
import { CommentType } from "./PostType";

// Use For normalize state slices
export interface NormalizeState<T> {
  byId: { [key: string]: T };
  allIds: string[];
  loading: Boolean;
  error: string | null;
}

export interface MessageNormalizeSate {
  byId: { [key: string]: Message[] }; // conversationId: Messages[]
  hasMore: { [key: string]: boolean };
  loading: { [key: string]: boolean }; //
  error: { [key: string]: string | null };
}

export interface NormalizeCommentState {
  byId: { [key: string]: CommentType[] }; // postId: commentData
  hasMore: { [key: string]: boolean };
  loading: { [key: string]: boolean };
  err: { [key: string]: string };
}
