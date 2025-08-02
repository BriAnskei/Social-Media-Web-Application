import {
  createAsyncThunk,
  createSlice,
  current,
  PayloadAction,
} from "@reduxjs/toolkit";
import { NormalizeCommentState } from "../../types/NormalizeType";
import { CommentType } from "../../types/PostType";
import { RootState } from "../../store/store";
import { commentApi } from "../../utils/api";

const initialState: NormalizeCommentState = {
  byId: {},
  hasMore: {},
  loading: {},
  err: {},
};

export const fetchComments = createAsyncThunk(
  "comment/get",
  async (
    payload: { postId: string; cursor?: string },
    { rejectWithValue, getState }
  ) => {
    try {
      const { postId, cursor } = payload;
      const state = getState() as RootState;
      const token = state.auth.accessToken;

      if (!token) return rejectWithValue("No token to process this request");

      const res = await commentApi.getComments({ token, postId, cursor });

      return res;
    } catch (error) {
      rejectWithValue("Failed on fetchComments" + (error as Error));
    }
  }
);

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    addComment: (state, action: PayloadAction<CommentType>) => {
      const postId = action.payload.postId;

      if (state.byId[postId]) state.byId[postId].push(action.payload);
    },
    resetCommets: (state, action) => {
      const postId = action.payload;
      state.byId[postId] = [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state, action) => {
        state.loading[action.meta.arg.postId] = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { postId } = action.meta.arg;
        const newComments = action.payload?.comments as CommentType[];
        const hasMore = action.payload?.hasMore as boolean;

        state.byId[postId] = [...newComments, ...(state.byId[postId] || [])];
        state.hasMore[postId] = hasMore;
        state.loading[postId] = false;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        const { postId } = action.meta.arg;
        state.err[postId] = action.payload as string;
        state.loading[postId] = false;
      });
  },
});

export const { addComment, resetCommets } = commentSlice.actions;
export default commentSlice.reducer;
