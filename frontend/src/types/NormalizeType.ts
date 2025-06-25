import { Message } from "./MessengerTypes";

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
