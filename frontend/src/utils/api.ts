import axios from "axios";
import { LoginTypes, RegisterTypes } from "../types/AuthTypes";
import { FetchedUserType, FollowPayload } from "../types/user";
import { CommentEventPayload, FetchPostType } from "../types/PostType";
import { NotificationType } from "../types/NotificationTypes";

// Axion instance
export const api = axios.create({
  baseURL: "http://localhost:4000",
});

export interface ApiResponse {
  success: boolean;
  token?: { refreshToken: string; accessToken: string };
  message?: string;
  user?: FetchedUserType[] | FetchedUserType;
  posts?: FetchPostType[] | FetchPostType;
  notifications?: NotificationType[] | NotificationType;
}

export const postApi = {
  update: async (
    token: string,
    data: FormData,
    postId: string
  ): Promise<ApiResponse> => {
    try {
      const response = await api.post(`/api/posts/update/${postId}`, data, {
        headers: {
          token,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Updating error" + error,
      };
    }
  },

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

  toggleLike: async (token: string, postId: string): Promise<ApiResponse> => {
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
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Network Error Occured",
      };
    }
  },

  uploadComment: async (data: CommentEventPayload): Promise<ApiResponse> => {
    try {
      const res = await api.post(
        "/api/posts/add-comment",
        {
          data,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Network Error Occured",
      };
    }
  },

  getPostById: async (postId: string): Promise<ApiResponse> => {
    try {
      if (!postId) {
        throw new Error("No PostId provided");
      }

      const response = await api.post(
        "api/posts/getpost",
        { postId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Network Error Occured",
      };
    }
  },

  delete: async (postId: string, token: string): Promise<ApiResponse> => {
    try {
      if (!postId) {
        throw new Error("No PostId provided");
      }
      const response = await api.post(
        "api/posts/delete",
        { postId },
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.log("Error deleteting post: ", error);
      return {
        success: false,
        message: "Network Error Occured: " + error,
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
  followToggle: async (data: FollowPayload): Promise<ApiResponse> => {
    try {
      const response = await api.post(
        "/api/users/follow",

        data,

        {
          headers: {
            "Content-Type": "application/json",
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

export const notificationApi = {
  addNotif: async (data: any): Promise<ApiResponse> => {
    try {
      const response = await api.post("api/notify/add", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Network Error Occured",
      };
    }
  },

  fetchAllNotif: async (token: string): Promise<ApiResponse> => {
    try {
      const response = await api.get("api/notify/get", {
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

  setReadNotif: async (
    token: string,
    allIds: String[]
  ): Promise<ApiResponse> => {
    try {
      if (!token) throw new Error("No token, cannot process");

      const response = await api.post(
        "api/notify/set-read",
        { allIds },
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Network Error Occured",
      };
    }
  },

  removeList: async (postId: string, token: string): Promise<ApiResponse> => {
    try {
      if (!token || !postId) throw new Error("No token/postId, cannot process");

      const res = await api.post(
        "api/notify/delete-notif",
        { postId },
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        }
      );

      return res.data;
    } catch (error) {
      console.error("Faild to remove notifs: ", error);
      return {
        success: false,
        message: "Network Error Occured",
      };
    }
  },
};
