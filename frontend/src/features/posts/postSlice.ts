import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { postApi } from "../../utils/api";
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
  async (data: FormData, { rejectWithValue, getState }) => {
    const { auth } = getState() as RootState;
    const accessToken = auth.accessToken;

    if (!accessToken) throw new Error("Access token is required");

    try {
      const res = await postApi.uploadPost(accessToken, data);

      if (!res.success) {
        return rejectWithValue(res.message || "Error Uploading post");
      }

      return res;
    } catch (error) {
      return rejectWithValue("Error Uploading post");
    }
  }
);

export const toggleLike = createAsyncThunk(
  "posts/toggle-like",
  async (postId: string, { rejectWithValue, getState, dispatch }) => {
    const { auth, user } = getState() as RootState;
    const userId = user.currentUserId!;
    const accessToken = auth.accessToken;

    if (!postId) throw new Error("No Post Id attached");

    if (!accessToken) throw new Error("Unauthorize");

    try {
      const res = await postApi.toggleLike(accessToken, postId);

      if (!res?.success)
        rejectWithValue(
          res?.message || "Faild to persist like data into POST object"
        );

      dispatch(postLiked({ postId, userId }));
      return res;
    } catch (error) {
      return rejectWithValue("Error Uploading post");
    }
  }
);

export const addComment = createAsyncThunk(
  "posts/add-comment",
  async (data: CommentEventPayload, { rejectWithValue, dispatch }) => {
    try {
      const res = await postApi.uploadComment(data);

      if (res.success) {
        // the reason we get this payload is to have accurate date for the comment
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

export const fetchPost = createAsyncThunk(
  "posts/getpost",
  async (postId: string, { rejectWithValue, getState }) => {
    try {
      // check first if the post already exist in the state
      const { posts } = getState() as RootState;

      if (posts.allIds.includes(postId) && posts.byId[postId]) {
        return { success: true, posts: posts.byId[postId] };
      }

      const res = await postApi.getPostById(postId);

      if (!res.success) {
        return rejectWithValue(res.message || "Failed to retrived post");
      }

      return res;
    } catch (error) {
      return rejectWithValue("Error getting post: " + error);
    }
  }
);

export const updatePost = createAsyncThunk(
  "post/update",
  async (
    { data, postId }: { data: FormData; postId: string },
    { rejectWithValue, getState, dispatch }
  ) => {
    try {
      const { auth } = getState() as RootState;
      const token = auth.accessToken;
      if (!token)
        return rejectWithValue("No access token to procces this request");
      const res = await postApi.update(token, data, postId);

      if (res.success) {
        dispatch(update(res.posts as FetchPostType));
      }

      return res;
    } catch (error) {
      rejectWithValue(error);
    }
  }
);

export const deletePost = createAsyncThunk(
  "post/delete",
  async (
    { postId, fileName }: { postId: string; fileName: string },
    { getState, rejectWithValue, dispatch }
  ) => {
    try {
      const { auth } = getState() as RootState;
      const token = auth.accessToken;

      if (!token || !postId)
        return rejectWithValue(
          "No access token/postId to procces this request"
        );

      const res = await postApi.delete(postId, fileName, token);

      if (res.success) {
        dispatch(dropPost(postId));
      }

      return res;
    } catch (error) {
      rejectWithValue(error);
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
    resetData: (state) => {
      state.allIds = [];
      state.byId = {};
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
    update: (state, action: PayloadAction<FetchPostType>) => {
      const postData = action.payload;

      const prevData = state.byId[postData._id];
      state.byId[postData._id] = {
        ...prevData,
        content: postData.content || "",
        image: postData.image || "",
      };
    },

    dropPost: (state, action) => {
      try {
        const postId = action.payload;

        delete state.byId[postId];
        state.allIds = state.allIds.filter((id) => id !== postId);
        console.log("Post succesfully deleted");
      } catch (error) {
        console.error("failed to delete", error);
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
      .addCase(createPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        const { byId, allIds } = normalizeResponse(action.payload.posts);

        if (!state.allIds.includes(allIds[0])) {
          state.allIds = [allIds[0], ...state.allIds]; // Put the latest post in the first index, to sort it
        }
        state.byId = { ...state.byId, ...byId };
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // toggle Post Cases(Likes)
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
      })

      // get post by id
      .addCase(fetchPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        const { byId, allIds } = normalizeResponse(action.payload.posts);
        state.loading = false;
        if (!state.allIds.includes(allIds[0]) && !state.byId[allIds[0]]) {
          state.allIds.unshift(allIds[0]);
          state.byId = { ...state.byId, ...byId };
        }
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // update
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // delete
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const {
  toggle,
  postLiked,
  commentOnPost,
  addPost,
  resetData,
  update,
  dropPost,
} = postsSlice.actions;
export default postsSlice.reducer;
