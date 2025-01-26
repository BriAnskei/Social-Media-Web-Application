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

// Types for normalize stated data
export interface PostsState {
  byId: Record<string, FetchPostType;
  allIds: string[];
  loading: boolean;
  error: string | null;
}
