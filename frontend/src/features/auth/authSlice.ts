import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AuthState, LoginTypes, RegisterTypes } from "../../types/AuthTypes";
import { authApi, userApi } from "../../utils/api";
import { getData } from "../users/userSlice";
import { RootState } from "../../store/store";

export const loginAuth = createAsyncThunk(
  "auth/login",
  async (credentials: LoginTypes, { rejectWithValue, dispatch }) => {
    try {
      const res = await authApi.login(credentials);
      const token = res.token;

      if (!res.success) {
        return rejectWithValue(res.message || "Login Failed"); // Creates a new payload to return error
      }

      if (token) {
        localStorage.setItem("token", token);
        await dispatch(getData(token));
      }
      return res;
    } catch (error) {
      return rejectWithValue("Login Failed");
    }
  }
);

export const registerAuth = createAsyncThunk(
  "auth/register",
  async (data: RegisterTypes, { rejectWithValue, dispatch }) => {
    try {
      const res = await authApi.register(data);

      if (!res.success) {
        return rejectWithValue(res.message || "Registration Failed");
      }

      if (res.token) {
        localStorage.setItem("token", res.token);
        await dispatch(getData(res.token));
      }

      return res;
    } catch (error) {
      return rejectWithValue("Registration failed");
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return rejectWithValue("No token");

      await dispatch(getData(token));
    } catch (error) {
      return rejectWithValue("Error Fetching user data");
    }
  }
);

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  isAuthenticated: Boolean(localStorage.getItem("token")),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");

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
      })
      // Fetching case
      .addCase(checkAuth.fulfilled, (state) => {
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isAuthenticated = false; // Invalid token or no token
        state.error = action.payload as string;
      });
  },
});

// Token for Object model manipulation.
export const userToken = (state: RootState): string | null => state.auth.token;

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
