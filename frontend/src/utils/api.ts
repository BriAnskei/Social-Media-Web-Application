import axios from "axios";
import { LoginTypes, RegisterTypes } from "../types/AuthTypes";
import { FollowPayload } from "../types/user";
import { CommentApiResponse, CommentEventPayload } from "../types/PostType";
import { ApiResponse, MessageApiResponse } from "../types/ApiResponseType";
import { openConversationPayload } from "../features/messenger/Conversation/conversationSlice";
import { Message } from "../types/MessengerTypes";

// Axion instance
export const api = axios.create({
  baseURL: "http://localhost:4000",
});

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

      console.log("Repsonse data: ", response.data);

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Network Error Occured",
      };
    }
  },

  uploadComment: async (
    data: CommentEventPayload
  ): Promise<ApiResponse & CommentApiResponse> => {
    try {
      const res = await api.post("/api/posts/add-comment", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
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

  delete: async (
    postId: string,
    fileName: string,
    token: string
  ): Promise<ApiResponse> => {
    try {
      if (!postId) {
        throw new Error("No PostId provided");
      }

      const response = await api.post(
        "api/posts/delete",
        { postId, fileName },
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

export const commentApi = {
  getComments: async (payload: {
    token: string;
    postId: string;
    cursor?: string;
  }): Promise<ApiResponse & { hasMore?: boolean }> => {
    try {
      const { token, postId, cursor } = payload;

      console.log("Getting comments: ", payload);

      const res = await api.get(`api/comment/get/${postId}`, {
        params: {
          cursor,
        },
        headers: {
          token,
          "Content-Type": "application/json",
        },
      });

      return res.data;
    } catch (error) {
      console.log(error);
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

  searchRedex: async (query: string): Promise<ApiResponse> => {
    try {
      const response = await api.post(`/api/users/search?query=${query}`);
      console.log(query, response.data);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Api error response",
      };
    }
  },
  getUserImages: async (
    userId: string,
    token: string
  ): Promise<
    ApiResponse & { images?: { posts: string[]; profile: string[] } }
  > => {
    //&  -> intersection.
    try {
      const response = await api.post(
        "/api/users/images",

        { userId },

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

export const MessageApi = {
  contacts: {
    getAllContact: async (token: string): Promise<MessageApiResponse> => {
      try {
        const res = await api.post(
          "api/messages/contact/get",
          {},
          {
            headers: {
              token,
              "Content-Type": "application/json",
            },
          }
        );

        return res.data;
      } catch (error) {
        return {
          success: false,
          message: error as string,
        };
      }
    },
  },
  conversation: {
    drop: async (
      token: string,
      conversationId: string
    ): Promise<MessageApiResponse> => {
      try {
        const res = await api.post(
          "api/messages/conversation/drop",
          { conversationId },
          {
            headers: {
              token,
              "Content-Type": "application/json",
            },
          }
        );
        return res.data;
      } catch (error) {
        return {
          success: false,
          message: error as string,
        };
      }
    },
    findOrUpdate: async (
      data: openConversationPayload & { token: string }
    ): Promise<MessageApiResponse> => {
      try {
        const { otherUser, contactId, token } = data;
        const res = await api.post(
          `api/messages/conversation/find/${contactId}`,
          { otherUser },
          {
            headers: {
              token,
              "Content-Type": "application/json",
            },
          }
        );

        return res.data;
      } catch (error) {
        return {
          success: false,
          message: error as string,
        };
      }
    },
    findOne: async (payload: {
      convoId: string;
      token: string;
    }): Promise<MessageApiResponse & { unreadIds?: string[] }> => {
      try {
        const { convoId, token } = payload;
        const res = await api.post(
          "api/messages/conversation/findOne",
          { convoId },
          {
            headers: {
              token,
              "Content-Type": "application/json",
            },
          }
        );
        return res.data as MessageApiResponse;
      } catch (error) {
        return {
          success: false,
          message: error as string,
        };
      }
    },
    getAll: async (data: {
      token: string;
      cursor?: string | null;
    }): Promise<
      MessageApiResponse & { hasMore?: boolean; unreadIds?: string[] }
    > => {
      try {
        const { token, cursor } = data;

        const res = await api.post(
          "api/messages/conversation/get",
          { cursor },
          {
            headers: {
              token,
              "Content-Type": "application/json",
            },
          }
        );

        return res.data;
      } catch (error) {
        return {
          success: false,
          message: error as string,
        };
      }
    },
  },
  message: {
    getMessagesByConvorsationId: async (
      conversationId: string,
      cursor: string | null,
      token: string
    ): Promise<MessageApiResponse & { hasMore?: boolean }> => {
      try {
        const res = await api.post(
          `api/messages/message/get/${conversationId}`,
          { cursor },
          {
            headers: {
              token,
              "Content-Type": "application/json",
            },
          }
        );

        return res.data;
      } catch (error) {
        return {
          success: false,
          message: error as string,
        };
      }
    },
    sentMessage: async (
      token: string,
      data: { mesage: Message; conversationId: string }
    ): Promise<MessageApiResponse> => {
      try {
        const formData = new FormData();
        const { sender, recipient, content, conversationId, createdAt } =
          data.mesage;

        formData.append("sender", sender);
        formData.append("recipient", recipient);
        formData.append("content", content);
        formData.append("createdAt", createdAt.toString());

        if (data.mesage.attachments) {
          formData.append("image", data.mesage.attachments as File);
        }

        const res = await api.post(
          `api/messages/message/sent/${conversationId}`,
          formData,
          {
            headers: {
              token,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return res.data;
      } catch (error) {
        return {
          success: false,
          message: error as string,
        };
      }
    },
  },
};
