export interface LoginTypes {
  email: string;
  password: string;
}

export interface RegisterTypes {
  username: string;
  fullName: string;
  email: string;
  password: string;
  profilePicture?: File;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
