import { FetchedUserType } from "./user";

export interface Message {
  _id?: string;
  sender: string;
  recipient: string;
  content: string;
  attachments?: string | File | null;
  read?: boolean;
  readAt?: string | null;
  conversationId: string;
  createdAt: string;
}

export interface ConversationType {
  _id: string;
  contactId: string;
  participant: FetchedUserType; // this is the other user
  isUserValidToRply: boolean;
  lastMessage: Message;
  lastMessageAt: string;
  lastMessageOnRead?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// api payload types
export interface SentMessagePayload {
  conversationId: string;
  recipent: string;
}
