import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { postApi } from "../../utils/api";
import { FetchPostType } from "../../types/PostType";

export const getPosts = createAsyncThunk(
  "posts/getPosts",
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await postApi.fetchPost();

      if (!response.success) {
        return rejectWithValue(response.message || "Fetching posts failed");
      }

      return response;
    } catch (error: any) {
      return rejectWithValue("Fetching posts failed");
    }
  }
);

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (data: FormData, { rejectWithValue, dispatch }) => {
    const token = localStorage.getItem("token");

    if (!token) return rejectWithValue("Unauthorize ");

    try {
      const res = await postApi.uploadPost(token, data);
      console.log("slice response: ", res);

      if (!res.success) {
        return rejectWithValue(res.message || "Error Uploading post");
      }

      // if api response is succesfull call the getPost to fetch all the post(including the new post)
      await dispatch(getPosts());
      return res;
    } catch (error) {
      return rejectWithValue("Error Uploading post");
    }
  }
);

interface PostsState {
  posts: FetchPostType[];
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
      // Fetching Post Cases
      .addCase(getPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.posts = action.payload.posts || state.posts; // This is where the probleme is.
        state.loading = false;
      })

      //Uploading Post Cases
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts = action.payload.posts || [];
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
