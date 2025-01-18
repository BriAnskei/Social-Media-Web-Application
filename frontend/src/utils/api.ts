import axios from "axios";
import { LoginTypes, RegisterTypes } from "../types/AuthTypes";
import { UserTypes } from "../types/user";
import { FetchPostType } from "../types/PostType";

const api = axios.create({
  baseURL: "http://localhost:4000",
});

export interface ApiResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: UserTypes;
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

      console.log("APi responce: ", response);

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Network Error Occured",
      };
    }
  },
};

export const userApi = {
  getData: async (token: string): Promise<ApiResponse> => {
    try {
      const response = await api.get("/api/users/me", {
        headers: {
          token,
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

  updateProfile: async (
    token: string,
    data: FormData
  ): Promise<ApiResponse> => {
    try {
      const response = await api.post("/api/users/update", data, {
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
};

export const authApi = {
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
