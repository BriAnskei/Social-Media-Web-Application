import axios from "axios";
import { LoginTypes, RegisterTypes } from "../types/AuthTypes";

const api = axios.create({
  baseURL: "http://localhost:4000",
});

// fetch all user's post
export const fetchPost = async () => {
  try {
    const response = await api.get(`/api/posts/postlist`);

    return response.data.data;
  } catch (error) {
    console.log("Error fetching post");
  }
};

// Login Requests
interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
  // Optional for token and message
}

export const authApi = {
  login: async (data: LoginTypes): Promise<AuthResponse> => {
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

  register: async (data: RegisterTypes): Promise<AuthResponse> => {
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

      console.log(response.data);

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Network Error Occured",
      };
    }
  },
};
