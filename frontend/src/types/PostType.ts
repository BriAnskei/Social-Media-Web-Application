export interface FetchPostType {
  _id: string;
  user: string;
  content: string;
  image?: string | File;
  likes: string[];
  comments: {
    user: string;
    content: string;
    createdAt: string;
  }[];
  createdAt: string;
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
