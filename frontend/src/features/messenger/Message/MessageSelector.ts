import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { createSelector } from "@reduxjs/toolkit";
import { Message } from "../../../types/MessengerTypes";

const byId = (state: RootState) => state.message.byId;
const allIds = (state: RootState) => state.message.allIds;
const loading = (state: RootState) => state.message.loading;

export const selectLatestMessage = createSelector(
  [byId, loading, (_, messageIds: string[]) => messageIds],
  (byId, loading, messageIds) => {
    const messages = messageIds.reduce((acc, id) => {
      acc[id] = byId[id];
      return acc;
    }, {} as { [key: string]: Message });

    return {
      messages,
      loading,
    };
  }
);
