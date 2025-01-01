import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { fetchPost } from "../../utils/api";
import { PostType } from "../../types/PostType";

export const getPosts = createAsyncThunk("posts/getPosts", async () => {
  try {
    const posts = await fetchPost();

    return posts;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

interface PostsState {
  posts: PostType[];
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
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
      .addCase(getPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.loading = false;
      });
  },
});

export const { toggle } = postsSlice.actions;
export default postsSlice.reducer;
