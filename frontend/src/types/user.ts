export interface UserTypes {
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
