import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { postApi } from "../../utils/api";
import { FetchPostType, LikeHandlerTypes } from "../../types/PostType";
import { NormalizeState } from "../../types/NormalizeType";
import { RootState } from "../../store/store";

interface Poststate extends NormalizeState<FetchPostType> {}

// Create the initial state using the adapter
const initialState: Poststate = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
};

export const fetchAllPost = createAsyncThunk(
  "posts/getPosts",
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await postApi.fetchPost();

      if (!response.success) {
        return rejectWithValue(response.message || "Fetching posts failed");
      }

      return response.posts;
    } catch (error: any) {
      return rejectWithValue("Fetching posts failed");
    }
  }
);

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (data: FormData, { rejectWithValue, dispatch, getState }) => {
    const { auth } = getState() as RootState;
    const accessToken = auth.accessToken;

    if (!accessToken) throw new Error("Access token is required");

    try {
      const res = await postApi.uploadPost(accessToken, data);

      if (!res.success) {
        return rejectWithValue(res.message || "Error Uploading post");
      }

      await dispatch(fetchAllPost());

      return res;
    } catch (error) {
      return rejectWithValue("Error Uploading post");
    }
  }
);

export const toggleLike = createAsyncThunk(
  "posts/toggle-like",
  async (postId: string, { rejectWithValue, getState }) => {
    const { auth, user } = getState() as RootState;

    const accessToken = auth.accessToken;
    const userId = user.currentUserId;
    if (!postId) throw new Error("No Post Id attached");

    if (!accessToken) throw new Error("Unauthorize");

    try {
      const res = await postApi.toggleLike(accessToken, postId);

      if (!res?.success) rejectWithValue(res?.message);

      return { postId, userId };
    } catch (error) {
      return rejectWithValue("Error Uploading post");
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    toggle: (
      _,
      action: PayloadAction<{ postId: string; userId: string }>
    ): void => {
      console.log(action.payload);
    },
    postLiked: (
      // global funtion
      state,
      action: PayloadAction<LikeHandlerTypes>
    ): void => {
      const { postId, userId } = action.payload;

      // check if the user is included in the likes array prop of post
      const isliked = state.byId[postId].likes.some(
        (likerId) => likerId === userId
      );

      if (!isliked) {
        state.byId[postId].likes.push(userId);
      } else {
        state.byId[postId].likes = state.byId[postId].likes.filter(
          (likeId) => likeId !== userId
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetching Post Cases
      .addCase(fetchAllPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPost.fulfilled, (state, action) => {
        state.loading = false;

        // Reset all data in the state
        state.byId = {};
        state.allIds = [];
        action.payload?.forEach((post) => {
          state.byId[post._id] = post;
          state.allIds.push(post._id);
        });
      })
      .addCase(fetchAllPost.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetchPosts";
      })

      // Uploading Post Cases
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // toggle Post Cases
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.loading = false;
        const { postId, userId } = action.payload;

        const isLiked = state.byId[action.payload.postId].likes.some(
          (like) => like === userId
        );

        if (!isLiked) {
          state.byId[postId].likes.push(userId!);
        } else {
          state.byId[postId].likes = state.byId[postId].likes.filter(
            (like) => like !== userId
          );
        }
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { toggle, postLiked } = postsSlice.actions;
export default postsSlice.reducer;
