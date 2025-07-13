import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";

const chatWindows = (state: RootState) => state.global.chatWindows;

export const selectChatWindows = createSelector([chatWindows], (chatWindows) =>
  chatWindows.map((chtWndws) => chtWndws.conversationId)
);
