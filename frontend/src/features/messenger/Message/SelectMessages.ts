import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../../store/store";
import { Message } from "../../../types/MessengerTypes";

const byId = (state: RootState) => state.message.byId;
const allIds = (state: RootState) => state.message.allIds;

export const selectMessagesByConvoId = createSelector(
  [byId, allIds, (_, convoId: string) => convoId],
  (byId, allIds, convoId) =>
    allIds
      .filter((id) => byId[id].conversationId === convoId)
      .map((id) => byId[id])
);
