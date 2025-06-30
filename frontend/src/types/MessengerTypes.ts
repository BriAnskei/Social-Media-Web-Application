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
  participant: FetchedUserType;
  isUserValidToRply: boolean;
  lastMessage: Message;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// api payload types
export interface SentMessagePayload {
  conversationId: string;
  recipent: string;
}
