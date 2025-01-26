export interface FetchedUserType {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  followers: string[];
  following: string[];
  createdAt: string;
}

export interface NewDataType {
  fullName: string;
  bio: string;
  profilePicture?: File;
}

// Normalize state Types
export interface UserState {
  byId: Record<string, FetchedUserType>;
  allIds: string[];
  loading: boolean;
  error: string | null;
}
