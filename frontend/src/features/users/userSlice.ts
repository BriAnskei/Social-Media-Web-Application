import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FetchedUserType, FollowPayload } from "../../types/user";
import { userApi } from "../../utils/api";
import { RootState } from "../../store/store";
import { NormalizeState } from "../../types/NormalizeType";
import { normalizeResponse } from "../../utils/normalizeResponse";
import { ApiResponse } from "../../types/ApiResponseType";

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
  async (data: FollowPayload, { rejectWithValue }) => {
    try {
      if (!data) {
        return rejectWithValue("No data recieved");
      }

      const res = await userApi.followToggle(data);

      return res;
    } catch (error) {
      return rejectWithValue("Follow toggle failed: " + error);
    }
  }
);

export const getImages = createAsyncThunk(
  "user/images",
  async (userId: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as RootState;
      const { accessToken } = auth;
      if (!userId || !accessToken)
        return rejectWithValue("No userId or token to dispatch this request");

      const res = await userApi.getUserImages(userId, accessToken);

      if (!res.success) {
        return rejectWithValue(res.message || "Failed to fecth images");
      }

      return res;
    } catch (error) {
      return rejectWithValue("Failed to fetch images: " + error);
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
      const { userId, followerId } = action.payload;
      const userToBeFollowed = state.byId[userId];
      const userWhoFollowed = state.byId[followerId];

      if (!userToBeFollowed || !userWhoFollowed) {
        throw new Error("Failed, user might not exist");
      } // Ensure users exist

      // Use Set to avoid duplicates efficiently
      const updatedFollowers = new Set(userToBeFollowed.followers);
      const updatedFollowing = new Set(userWhoFollowed.following);

      if (updatedFollowers.has(followerId)) {
        updatedFollowers.delete(followerId);
        updatedFollowing.delete(userId);
      } else {
        updatedFollowers.add(followerId);
        updatedFollowing.add(userId);
      }

      // Convert Set back to array for state update
      userToBeFollowed.followers = Array.from(updatedFollowers);
      userWhoFollowed.following = Array.from(updatedFollowing);
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
        // Get data
        const normalizedData = normalizeResponse(action.payload);

        state.byId = { ...state.byId, ...normalizedData.byId };
        if (!state.allIds.includes(normalizedData.allIds[0])) {
          state.allIds.push(normalizedData.allIds[0]);
        }

        state.currentUserId = normalizedData.allIds[0];
        console.log("Expected current user Id: ", state.currentUserId);

        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(followToggled.rejected, (state, action) => {
        const { userId, followerId } = action.meta.arg;
        const userToBeFollowed = state.byId[userId];
        const userWhoFollowed = state.byId[followerId];

        if (userToBeFollowed && userWhoFollowed) {
          const updatedFollowers = new Set(userToBeFollowed.followers);
          const updatedFollowing = new Set(userWhoFollowed.following);

          updatedFollowers.delete(followerId);
          updatedFollowing.delete(userId);

          if (
            updatedFollowers.has(followerId) &&
            updatedFollowing.has(userId)
          ) {
            updatedFollowers.delete(followerId);
            updatedFollowing.delete(userId);
          } else {
            updatedFollowers.add(followerId);
            updatedFollowing.add(userId);
          }

          userToBeFollowed.followers = Array.from(updatedFollowers);
          userWhoFollowed.following = Array.from(updatedFollowing);
        }
      });
  },
});

export const { clearData, updateFollow } = userSlice.actions;
export default userSlice.reducer;
