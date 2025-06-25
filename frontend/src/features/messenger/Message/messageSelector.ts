import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../../store/store";

const byId = (state: RootState) => state.message.byId;
const hasMore = (state: RootState) => state.message.hasMore;
const loading = (state: RootState) => state.message.loading;

export const selectMessageByConversation = createSelector(
  [byId, hasMore, loading, (_, convoId: string) => convoId],
  (byId, hasMore, loading, convoId) => ({
    messages: byId[convoId],
    hasMore: hasMore[convoId],
    loading: loading[convoId],
  })
);
