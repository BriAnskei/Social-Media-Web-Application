import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AuthState, LoginInputs, UserTypes } from "../../types/AuthTypes";
import { authApi } from "../../utils/api";

export const loginAuth = createAsyncThunk(
  "auth/login",
  async (credentials: LoginInputs, { rejectWithValue }) => {
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

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: null,
  isAuthenticated: !!localStorage.getItem("token"),
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
      .addCase(loginAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token || null;
      })
      .addCase(loginAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
