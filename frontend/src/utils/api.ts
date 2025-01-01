import axios from "axios";
import { LoginInputs } from "../types/AuthTypes";

const api = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

// fetch all user's post
export const fetchPost = async () => {
  const response = await api.get(`/api/posts/postlist`);

  return response.data.data;
};

// Login Requests
interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
  // Optional for token and message
}

export const authApi = {
  login: async (data: LoginInputs): Promise<LoginResponse> => {
    try {
      const response = await api.post("/api/users/login", data);

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Network Error Occured",
      };
    }
  },
};
