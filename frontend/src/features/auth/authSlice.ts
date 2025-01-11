import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AuthState, LoginTypes, RegisterTypes } from "../../types/AuthTypes";
import { authApi } from "../../utils/api";

export const loginAuth = createAsyncThunk(
  "auth/login",
  async (credentials: LoginTypes, { rejectWithValue }) => {
    try {
      const res = await authApi.login(credentials);

      if (!res.success) {
        return rejectWithValue(res.message || "Login Failed"); // Creates a new payload to return error
      }

      if (res.token) {
        localStorage.setItem("token", res.token);
      }
      return res;
    } catch (error) {
      return rejectWithValue("Login Failed");
    }
  }
);

export const registerAuth = createAsyncThunk(
  "auth/register",
  async (data: RegisterTypes, { rejectWithValue }) => {
    try {
      const res = await authApi.register(data);

      if (!res.success) {
        return rejectWithValue(res.message || "Registration Failed");
      }

      if (res.token) {
        localStorage.setItem("token", res.token);
      }

      return res;
    } catch (error) {
      return rejectWithValue("Registration failed");
    }
  }
);

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: null,
  isAuthenticated: Boolean(localStorage.getItem("token")),
  //double negation
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      state.user = null;

      state.isAuthenticated = false;
      state.token = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token || null;
        state.isAuthenticated = Boolean(state.token);
      })
      .addCase(loginAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Registration cases
      .addCase(registerAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token || null;
        state.isAuthenticated = Boolean(action.payload.token);
      })
      .addCase(registerAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
