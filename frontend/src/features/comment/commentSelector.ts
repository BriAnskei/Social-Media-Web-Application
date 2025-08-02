import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";

const byId = (state: RootState) => state.comments.byId;
const hasMore = (state: RootState) => state.comments.hasMore;
const loading = (state: RootState) => state.comments.loading;
const err = (state: RootState) => state.comments.err;

export const selectComment = createSelector(
  [byId, hasMore, loading, (_, postId: string) => postId, err],
  (byId, hasMore, loading, postId, err) => ({
    comments: byId[postId],
    hasMore: hasMore[postId],
    loading: loading[postId],
    err: err[postId],
  })
);
