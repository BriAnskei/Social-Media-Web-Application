import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, LoginTypes, RegisterTypes } from "../../types/AuthTypes";
import { api, authApi } from "../../utils/api";
import { fetchCurrentUser, clearData } from "../users/userSlice";
import { AppThunk } from "../../store/store";

export const loginAuth = createAsyncThunk(
  "auth/login",
  async (credentials: LoginTypes, { rejectWithValue, dispatch }) => {
    try {
      const res = await authApi.login(credentials);
      const token = res.token;

      if (!res.success) {
        return rejectWithValue(res.message || "Login Failed"); // Creates a new payload to return error
      }

      if (!token) throw new Error("No Token has been attached in reponse");

      localStorage.setItem("access_token", token.accessToken);
      localStorage.setItem("refresh_token", token.refreshToken);
      await dispatch(fetchCurrentUser(token.accessToken));

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
      const token = res.token;
      if (!token) throw new Error("No Token has been attached in reponse");

      localStorage.setItem("access_token", token.accessToken);
      localStorage.setItem("refresh_token", token.refreshToken);
      await dispatch(fetchCurrentUser(token.accessToken));

      return res;
    } catch (error) {
      return rejectWithValue("Registration failed");
    }
  }
);

const initialState: AuthState = {
  accessToken: localStorage.getItem("access_token") || null, // used for fetching data
  refreshToken: localStorage.getItem("refresh_token") || null, // used for token reinitialize(refresh)
  isAuthenticated: Boolean(localStorage.getItem("access_token")),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },

    clearError: (state) => {
      state.error = null;
    },
    refreshAcessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
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
        state.isAuthenticated = Boolean(action.payload.token);
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
        state.isAuthenticated = Boolean(action.payload.token);
      })
      .addCase(registerAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const refreshToken = (): AppThunk => async (dispatch, getState) => {
  const { refreshToken } = getState().auth;
  if (!refreshToken) {
    dispatch(clearData());
    dispatch(logout());

    return;
  }

  try {
    const response = await api.post("/api/token/refresh", refreshToken, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.data.sucess) {
      throw new Error("Failed to refresh token");
    }

    const { newAccessToken } = response.data;
    dispatch(refreshAcessToken(newAccessToken));
  } catch (error) {
    dispatch(clearData());
    dispatch(logout());
  }
};

export const { logout, clearError, refreshAcessToken } = authSlice.actions;
export default authSlice.reducer;
