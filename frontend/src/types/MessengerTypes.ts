interface UnreadType {
  user: string;
  count: number;
}

interface Attachment {
  type: string;
  url: string;
  fileName?: string;
  fileSize?: number;
}

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

export interface Conversation {
  _id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCounts: UnreadType[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatWindowType {
  convoId: string;
  userId: string;
  minimized: boolean;
  createdAt: string;
  updatedAt: string;
}
