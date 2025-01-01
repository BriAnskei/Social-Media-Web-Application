export interface UserTypes {
  username: string;
  fullName: string;
  email: string;
  password: string;
  profilePicture: string;
  bio: string;
  followers: string[];
  following: string[];
  createdAt: string;
}

export interface LoginInputs {
  email: string;
  password: string;
}

export interface AuthState {
  token: string | null;
  user: UserTypes | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
