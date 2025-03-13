export interface FetchPostType {
  _id: string;
  user: string;
  content: string;
  image?: string;
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

export interface LikeHandlerTypes {
  postId: string;
  postOwnerId: string;
  userId: string; // sender
  username: string;
}

// for commenting post
export interface CommentType {
  postId: string;
  data: {
    user: string;
    content: string;
  };
}

export interface CommentEventPayload {
  postId: string;
  postOwnerId: string;
  data: {
    user: string;
    content: string;
    createdAt: Date;
  };
}
