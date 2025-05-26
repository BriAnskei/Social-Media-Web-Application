import { FetchedUserType } from "./user";

export interface Message {
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  attachments?: string; // for images(for now)
  read: boolean;
  readAt: string | null;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationType {
  _id: string;
  contactId: string;
  participant: FetchedUserType; // we only show the other participant in here
  isUserValidToRply: boolean;
  lastMessage: Message;
  lastMessageAt: Date;
  unreadCounts: number;
  createdAt: string;
  updatedAt: string;
}

// api payload types
export interface SentMessagePayload {
  token: string;
  conversationId: string;
  recipent: string;
}
