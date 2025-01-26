import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { postApi } from "../../utils/api";
import { FetchPostType, PostsState } from "../../types/PostType";

export const getPosts = createAsyncThunk(
  "posts/getPosts",
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await postApi.fetchPost();

      if (!response.success) {
        return rejectWithValue(response.message || "Fetching posts failed");
      }

      // Normalize posts data
      const postsById = response.posts?.reduce(
        (acc: Record<string, FetchPostType>, post: FetchPostType) => {
          acc[post._id] = post;
          return acc;
        },
        {}
      );

      const allPostIds = response.posts?.map((post: FetchPostType) => post._id);

      return { postsById, allPostIds };
    } catch (error: any) {
      return rejectWithValue("Fetching posts failed");
    }
  }
);

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (data: FormData, { rejectWithValue }) => {
    const token = localStorage.getItem("token");

    if (!token) return rejectWithValue("Unauthorize ");

    try {
      const res = await postApi.uploadPost(token, data);

      if (!res.success) {
        return rejectWithValue(res.message || "Error Uploading post");
      }

      // Normalize posts data
      const postsById = res.posts?.reduce(
        (acc: Record<string, FetchPostType>, post: FetchPostType) => {
          acc[post._id] = post;
          return acc;
        },
        {}
      );

      const allPostIds = res.posts?.map((post: FetchPostType) => post._id);

      return { postsById, allPostIds };
    } catch (error) {
      return rejectWithValue("Error Uploading post");
    }
  }
);

const initialState: PostsState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    toggle: () => {
      console.log("BUtton clicked");
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetching Post Cases
      .addCase(getPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.byId = action.payload.postsById || {};
        state.allIds = action.payload.allPostIds || [];
        state.loading = false;
      })

      //Uploading Post Cases
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.byId = action.payload.postsById || {};
        state.allIds = action.payload.allPostIds || [];
        state.loading = false;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "An unexpected error occured";
      });
  },
});

export const { toggle } = postsSlice.actions;
export default postsSlice.reducer;
