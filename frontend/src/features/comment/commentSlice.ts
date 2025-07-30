import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CommentType } from "../../types/PostType";

export interface IComment extends CommentType {
  postId: string;
}

interface CommentState {
  byId: { [key: string]: IComment[] }; // postId: commentData
  loading: { [key: string]: boolean };
  err: { [key: string]: string };
}

const initialState: CommentState = {
  byId: {},
  loading: {},
  err: {},
};

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    addComment: (state, action: PayloadAction<IComment>) => {
      const payLoad = action.payload;
      state.byId[payLoad.postId].push(payLoad);
    },
  },
});

export const { addComment } = commentSlice.actions;
export default commentSlice.reducer;
