import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { ApiResponse, postApi } from "../../utils/api";
import {
  CommentEventPayload,
  FetchPostType,
  LikeHandlerTypes,
} from "../../types/PostType";
import { NormalizeState } from "../../types/NormalizeType";
import { RootState } from "../../store/store";
import normalizeResponse from "../../utils/normalizeResponse";

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

      if (res.posts) {
        dispatch(addPost(res.posts as FetchPostType)); // enter a single object
      }

      location.reload();

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

      if (!res?.success)
        rejectWithValue(
          res?.message || "Faild to persist like data into POST object"
        );

      return { postId, userId };
    } catch (error) {
      return rejectWithValue("Error Uploading post");
    }
  }
);

// extend the comment object for returned comment data.
// the reason we get this payload is to have accurate date for the comment
interface CommentRes extends ApiResponse {
  commentData?: {
    user: string;
    content: string;
    createdAt: string;
  };
}
export const addComment = createAsyncThunk(
  "posts/add-comment",
  async (data: CommentEventPayload, { rejectWithValue, dispatch }) => {
    try {
      const res: CommentRes = await postApi.uploadComment(data);

      if (res.success) {
        // if response is successfull, it will sure to have a payload of 'CommentRes' type
        // if not return the errror message payload
        const resData: CommentEventPayload = {
          postId: data.postId,
          data: res.commentData!,
        };
        dispatch(commentOnPost(resData));
      }
      return res;
    } catch (error) {
      return rejectWithValue("Error adding comment: " + error);
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
    addPost: (state, action: PayloadAction<FetchPostType>): void => {
      const { allIds, byId } = normalizeResponse(action.payload);

      if (!state.allIds.includes(allIds[0])) {
        state.allIds.push(allIds[0]);
      }
      state.byId = { ...state.byId, ...byId };
    },
    commentOnPost: (
      state,
      action: PayloadAction<CommentEventPayload>
    ): void => {
      if (state.byId[action.payload.postId]) {
        const { data, postId } = action.payload;
        const commentData = {
          user: data.user,
          content: data.content,
          createdAt: data.createdAt!,
        };

        if (state.byId[postId]) {
          state.byId[postId].comments.push(commentData);
        }
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

        const { allIds, byId } = normalizeResponse(action.payload);

        // Reset all data in the state
        state.byId = {};
        state.allIds = [];

        state.allIds = allIds;
        state.byId = { ...state.byId, ...byId };
      })
      .addCase(fetchAllPost.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetchPosts";
      })

      // Uploading Post Cases
      .addCase(createPost.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // toggle Post Cases(Likes)
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
      })

      // add-comment
      .addCase(addComment.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { toggle, postLiked, commentOnPost, addPost } = postsSlice.actions;
export default postsSlice.reducer;
