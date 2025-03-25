import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FetchedUserType, FollowPayload } from "../../types/user";
import { ApiResponse, userApi } from "../../utils/api";
import { RootState } from "../../store/store";
import { NormalizeState } from "../../types/NormalizeType";
import normalizeResponse from "../../utils/normalizeResponse";
import { data } from "react-router";

export const getUsersData = createAsyncThunk(
  "user/getUsersData",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await userApi.getAllUsers(token);

      if (!res.success)
        return rejectWithValue(res.message || "Error fetching users data");

      return res.user;
    } catch (error) {
      console.log(error);
      return rejectWithValue("Error fetching users data");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (token: string, { rejectWithValue, dispatch }) => {
    if (!token) return rejectWithValue("Unauthorize ");
    try {
      const res = await userApi.getCurrentUser(token);

      if (!res.success) {
        return rejectWithValue(res.message || "Error fetching current user");
      }

      await dispatch(getUsersData(token));

      return res.user;
    } catch (error) {
      console.log(error);
      return rejectWithValue("Error fetching users data");
    }
  }
);

export const updateCurrentUser = createAsyncThunk<
  ApiResponse,
  FormData,
  { state: RootState }
>(
  "user/updateData",
  async (data: FormData, { rejectWithValue, dispatch, getState }) => {
    const { auth } = getState() as RootState;
    const accessToken = auth.accessToken;

    if (!accessToken) throw new Error("Access token is required");
    try {
      const res = await userApi.updateProfile(accessToken, data);

      if (!res.success)
        return rejectWithValue(res.message || "Editing profile failed");

      await dispatch(getUsersData(accessToken));

      return res;
    } catch (error) {
      return rejectWithValue("Editing profile failed: " + error);
    }
  }
);

export const followToggled = createAsyncThunk(
  "user/follow",
  async (data: FollowPayload, { rejectWithValue, dispatch }) => {
    try {
      if (!data) throw new Error("No Data recieve");

      const res = await userApi.followToggle(data);

      if (res.success) {
        dispatch(updateFollow(data.followerId));
      }

      return res;
    } catch (error) {
      return rejectWithValue("Follow toggle failed: " + error);
    }
  }
);

interface UserState extends NormalizeState<FetchedUserType> {
  currentUserId: string | null;
}

const initialState: UserState = {
  byId: {},
  allIds: [],
  currentUserId: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearData: (state) => {
      state.byId = {};
      state.allIds = [];
      state.currentUserId = null;
    },
    updateFollow: (state, action) => {
      const userId = action.payload;

      const userData: FetchedUserType = state.byId[state.currentUserId!];

      if (userData.followers.includes(userId)) {
        userData.followers.indexOf(userId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // getData casses
      .addCase(getUsersData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsersData.fulfilled, (state, action) => {
        state.loading = false;
        const normalizedData = normalizeResponse(action.payload);
        // Reset all data, before initializing
        state.byId = {};
        state.allIds = [];
        state.byId = normalizedData.byId;
        state.allIds = normalizedData.allIds;
      })
      .addCase(getUsersData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update cases
      .addCase(updateCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCurrentUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetching current user cases
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;

        // Get data
        const normalizedData = normalizeResponse(action.payload);

        state.byId = { ...state.byId, ...normalizedData.byId };
        if (!state.allIds.includes(normalizedData.allIds[0])) {
          state.allIds.push(normalizedData.allIds[0]);
        }

        state.currentUserId = normalizedData.allIds[0];
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearData, updateFollow } = userSlice.actions;
export default userSlice.reducer;
