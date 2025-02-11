import axios from "axios";
import { LoginTypes, RegisterTypes } from "../types/AuthTypes";
import { FetchedUserType } from "../types/user";
import { FetchPostType } from "../types/PostType";

// Axion instance
export const api = axios.create({
  baseURL: "http://localhost:4000",
});

export interface ApiResponse {
  success: boolean;
  token?: { refreshToken: string; accessToken: string };
  message?: string;
  user?: FetchedUserType[] | FetchedUserType;
  posts?: FetchPostType[];
}

export const postApi = {
  fetchPost: async (): Promise<ApiResponse> => {
    try {
      const response = await api.get(`/api/posts/postlist`);

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Network Error Occured",
      };
    }
  },
  uploadPost: async (token: string, data: FormData): Promise<ApiResponse> => {
    try {
      const response = await api.post(`/api/posts/upload`, data, {
        headers: {
          token,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Network Error Occured",
      };
    }
  },

  toggleLike: async (token: string, postId: string) => {
    try {
      const response = await api.post(
        "/api/posts/like-toggle",
        { postId },
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        }
      );
      response.data;
    } catch (error) {
      return {
        success: false,
        message: "Network Error Occured",
      };
    }
  },
};

export const userApi = {
  getAllUsers: async (token: string): Promise<ApiResponse> => {
    try {
      const response = await api.get("/api/users/users", {
        headers: {
          token,
        },
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Network Error Occured",
      };
    }
  },

  updateProfile: async (
    token: string,
    data: FormData
  ): Promise<ApiResponse> => {
    try {
      const response = await api.put("/api/users/update", data, {
        headers: {
          token,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Api error response",
      };
    }
  },

  getCurrentUser: async (token: string): Promise<ApiResponse> => {
    try {
      const response = await api.get(
        "/api/users/me",

        {
          headers: {
            token,
          },
        }
      );

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Api error response",
      };
    }
  },
};

export const authApi = {
  checkAuthentication: async (token: string): Promise<ApiResponse> => {
    try {
      const response = await api.get("/api/users/authentication", {
        headers: {
          token,
        },
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Api error response",
      };
    }
  },

  login: async (data: LoginTypes): Promise<ApiResponse> => {
    try {
      const response = await api.post("/api/users/login", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Network Error Occured",
      };
    }
  },

  register: async (data: RegisterTypes): Promise<ApiResponse> => {
    try {
      const formData = new FormData();

      formData.append("username", data.username);
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      formData.append("password", data.password);

      // Append file if it exists
      if (data.profilePicture) {
        formData.append("profilePicture", data.profilePicture);
      }

      const response = await api.post("/api/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Network Error Occured",
      };
    }
  },
};
