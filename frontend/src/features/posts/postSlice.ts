import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { postApi } from "../../utils/api";
import { FetchPostType, LikeHandlerTypes } from "../../types/PostType";
import { NormalizeState } from "../../types/NormalizeType";
import { RootState } from "../../store/store";
import { normalizeResponse } from "../../utils/normalizeResponse";

interface Poststate extends NormalizeState<FetchPostType> {
  hasMore: boolean;
  fetchingMore: boolean;
  userPostIds: string[];
  userPostById: { [key: string]: FetchPostType };
  hasMoreUserPost: boolean;
}

// Create the initial state using the adapter
const initialState: Poststate = {
  byId: {},
  allIds: [],
  // viewing user profile(post)
  userPostIds: [],
  userPostById: {},
  hasMoreUserPost: false,

  loading: false,
  fetchingMore: false,
  hasMore: false,
  error: null,
};

export const fetchUserPost = createAsyncThunk(
  "posts/userPosts",
  async (
    payload: { userId: string; cursor?: string },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as RootState;

      const { userId, cursor } = payload;
      const token = state.auth.accessToken;
      if (!token)
        return rejectWithValue("accessToken is requied for this process");

      console.log("fetching user posts: ", token, userId, cursor);

      const res = await postApi.fetchUserPost({ token, userId, cursor });

      return res;
    } catch (error) {
      rejectWithValue("Failed to fetch posts: " + error);
    }
  }
);

export const fetchAllPost = createAsyncThunk(
  "posts/getPosts",
  async (payload: { cursor?: string }, { rejectWithValue }) => {
    try {
      const response = await postApi.fetchPost(payload.cursor);

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
  async (
    payload: { postId: string; userName: string },
    { rejectWithValue, getState, dispatch }
  ) => {
    const { postId, userName } = payload;

    const { auth, user } = getState() as RootState;
    const userId = user.currentUserId!;
    const accessToken = auth.accessToken;

    if (!postId) throw new Error("No Post Id attached");

    if (!accessToken) throw new Error("Unauthorize");
    dispatch(postLiked({ postId, userId }));

    try {
      const res = await postApi.toggleLike({
        token: accessToken,
        postId,
        userName,
      });

      if (!res?.success)
        rejectWithValue(
          res?.message || "Faild to persist like data into POST object"
        );

      return res;
    } catch (error) {
      return rejectWithValue("Error Uploading post");
    }
  }
);

export const fetchPost = createAsyncThunk(
  "posts/getpost",
  async (postId: string, { rejectWithValue, getState }) => {
    try {
      // check first if the post already exist in the state
      const { posts } = getState() as RootState;

      if (posts.byId[postId]) {
        console.log("POST ALREADY EXIST");

        return { success: true, posts: posts.byId[postId] };
      }

      const res = await postApi.getPostById(postId);
      console.log("fetching post response: ", res);

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
    resetData: () => {
      return initialState;
    },
    resetUsersPosts: (state) => {
      state.hasMoreUserPost = false;
      state.userPostById = {};
      state.userPostIds = [];
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

        if (state.userPostById[postId]) {
          state.userPostById[postId].likes.push(userId);
        }
      } else {
        state.byId[postId].likes = state.byId[postId].likes.filter(
          (likeId) => likeId !== userId
        );

        if (state.userPostById[postId]) {
          state.byId[postId].likes = state.byId[postId].likes.filter(
            (likeId) => likeId !== userId
          );
        }
      }
    },
    addPost: (state, action: PayloadAction<FetchPostType>): void => {
      const { allIds, byId } = normalizeResponse(action.payload);

      if (!state.allIds.includes(allIds[0])) {
        state.allIds = [allIds[0], ...state.allIds];
        state.byId = { ...state.byId, ...byId };
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

      if (state.userPostById[postData._id]) {
        state.userPostById[postData._id] = {
          ...state.byId[postData._id],
          content: postData.content || "",
          image: postData.image || "",
        };
      }
    },

    dropPost: (state, action) => {
      try {
        const postId = action.payload;

        delete state.byId[postId];
        state.allIds = state.allIds.filter((id) => id !== postId);
      } catch (error) {
        console.error("failed to delete", error);
      }
    },
    increamentComment: (state, action) => {
      const postId: string = action.payload;
      state.byId[postId].totalComments += 1;

      // this will also update the profile page posts
      if (state.userPostById[postId]) {
        state.userPostById[postId].totalComments += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchAllPost.pending, (state, action) => {
        if (action.meta.arg.cursor) {
          state.fetchingMore = true;
        } else {
          state.loading = true;
        }

        state.error = null;
      })
      .addCase(fetchAllPost.fulfilled, (state, action) => {
        const { allIds, byId } = normalizeResponse(action.payload.posts);

        state.allIds = [...state.allIds, ...allIds];
        state.byId = { ...state.byId, ...byId };
        state.hasMore = action.payload.hasMore ?? false;
        state.loading = false;
        state.fetchingMore = false;
      })
      .addCase(fetchAllPost.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to fetchPosts";
        state.fetchingMore = false;
        state.loading = false;
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

      // get post by id
      .addCase(fetchPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        const { byId, allIds } = normalizeResponse(action.payload.posts);

        if (!state.allIds.includes(allIds[0]) && !state.byId[allIds[0]]) {
          state.allIds.unshift(allIds[0]);
          state.byId = { ...state.byId, ...byId };
        }
        state.loading = false;
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
      })
      .addCase(fetchUserPost.pending, (state, action) => {
        if (action.meta.arg.cursor) {
          state.fetchingMore = true;
        } else {
          state.loading = true;
        }
      })
      .addCase(fetchUserPost.fulfilled, (state, action) => {
        const { byId, allIds } = normalizeResponse(action.payload?.posts);
        const hasMore = action.payload?.hasMore;

        state.hasMoreUserPost = hasMore ?? false;

        state.userPostById = { ...state.userPostById, ...byId };
        state.userPostIds = [...state.userPostIds, ...allIds];

        state.fetchingMore = false;
        state.loading = false;
      })
      .addCase(fetchUserPost.rejected, (state, action) => {
        state.error = action.payload as string;
        state.fetchingMore = false;
        state.loading = false;
      });
  },
});

export const {
  postLiked,
  increamentComment,
  addPost,
  resetData,
  resetUsersPosts,
  update,
  dropPost,
} = postsSlice.actions;
export default postsSlice.reducer;
