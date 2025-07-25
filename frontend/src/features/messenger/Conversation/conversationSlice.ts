import { NormalizeState } from "../../../types/NormalizeType";
import { ConversationType, Message } from "../../../types/MessengerTypes";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { MessageApi } from "../../../utils/api";
import { RootState } from "../../../store/store";
import { normalizeResponse } from "../../../utils/normalizeResponse";
import { ClosedConversationMessagePayload } from "../../../hooks/socket/useChatSocket";

export const deleteConversation = createAsyncThunk(
  "conversation/drop",
  async (conversationId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.accessToken;
      if (!token) {
        return rejectWithValue(
          "Failed to delete conversation: Token is required to process this request"
        );
      }

      const res = await MessageApi.conversation.drop(token, conversationId);

      return res;
    } catch (error) {
      rejectWithValue("Failed to delete Conversation: " + error);
    }
  }
);

export interface FetchConvosProps {
  cursor?: string | null;
}

export const fetchAllConvoList = createAsyncThunk(
  "conversation/fetchAll",
  async (data: FetchConvosProps, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { accessToken } = state.auth;
      if (!accessToken) {
        return rejectWithValue("No access token to process this request");
      }

      const res = await MessageApi.conversation.getAll({
        token: accessToken,
        cursor: data.cursor,
      });

      const { hasMore, conversations } = res;

      return { hasMore, conversations };
    } catch (error) {
      rejectWithValue("Failed to fetch convo list: " + error || "Error");
    }
  }
);

export interface openConversationPayload {
  otherUser: string;
  contactId: string;
}

export const openConversation = createAsyncThunk(
  "conversation/open",
  async (
    data: openConversationPayload,
    { rejectWithValue, getState, dispatch }
  ) => {
    try {
      const { auth } = getState() as RootState;
      const token = auth.accessToken;

      if (!token) {
        return rejectWithValue(
          "Failed to open conversation: Token is required to process this request"
        );
      }

      const payload = { ...data, token };
      const res = await MessageApi.conversation.findOrUpdate(payload);

      return res;
    } catch (error) {
      rejectWithValue("Failed to open conversation: " + error);
    }
  }
);

export const findOneConvoUpdate = createAsyncThunk(
  "conversation/checkExisting",
  async (
    payload: ClosedConversationMessagePayload,
    { getState, rejectWithValue, dispatch }
  ) => {
    try {
      const { conversation: convoPayload, messageData } = payload;

      const { conversation, auth } = getState() as RootState;
      const { byId } = conversation;
      const accessToken = auth.accessToken;

      const isConversationExist = Boolean(byId[convoPayload._id]);

      let res;

      if (isConversationExist) {
        dispatch(
          setLatestMessage({
            conversation: payload.conversation,
            messageData: payload.messageData,
            updatedAt: payload.messageData.createdAt,
          })
        );
        dispatch(increamentUnread(payload.conversation._id));
        dispatch(addUnreadConvo(payload.conversation._id));
      } else {
        res = await MessageApi.conversation.findOne({
          convoId: payload.conversation._id,
          token: accessToken!,
        });
      }
      return res;
    } catch (error) {
      rejectWithValue("Failed to checkConversationifExist" + error);
    }
  }
);

interface ConversationState extends NormalizeState<ConversationType> {
  isFetchingMore: boolean;
  unreadIds: string[];
}

const initialState: ConversationState = {
  byId: {},
  allIds: [],
  isFetchingMore: false,
  unreadIds: [],
  loading: false,
  error: null,
};

export interface latestMessagePayload {
  conversation: ConversationType;
  messageData: Message;
  updatedAt: string;
}

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    addUnreadConvo: (state, action) => {
      const convoId = action.payload as string;
      if (!state.unreadIds.includes(convoId)) {
        state.unreadIds.push(convoId);
      }
    },
    deleteConvoInUnRead: (state, action) => {
      const convoId = action.payload;

      state.unreadIds = state.unreadIds.filter(
        (unreadId) => unreadId !== convoId
      );
    },
    dropConversation: (state, action) => {
      const convoId = action.payload;
      const isConvoValid = Boolean(state.byId[convoId].lastMessage);
      2;

      // drop conversation if there is no lastMessage
      if (!isConvoValid) {
        state.allIds = state.allIds.filter((id) => id !== convoId);
        delete state.byId[convoId];
      }
    },
    increamentUnread: (state, action) => {
      const convoId = action.payload;

      state.byId[convoId].unreadCount += 1;
    },
    setLatestMessage: (state, action: PayloadAction<latestMessagePayload>) => {
      const { conversation, messageData, updatedAt } = action.payload;
      const { allIds, byId } = normalizeResponse(conversation);

      const dataIndex = state.allIds.findIndex((id) => id === allIds[0]);

      if (dataIndex === -1) {
        console.log("Conversatrion is not im the state yet, addign");

        state.allIds = [allIds[0], ...state.allIds];
        state.byId = { ...state.byId, ...byId };
      } else {
        state.allIds.splice(dataIndex, 1);
        state.allIds.unshift(allIds[0]);

        state.byId[conversation._id].lastMessage = messageData;
        state.byId[conversation._id].lastMessageAt = updatedAt;
        state.byId[conversation._id].updatedAt = updatedAt;
      }
    },
    setConvoToInvalid: (state, action) => {
      const convoId = action.payload;

      if (convoId && state.byId[convoId]) {
        state.byId[convoId].isUserValidToRply = false;
      }
    },
    setConvoToValid: (state, action) => {
      const convoId = action.payload;

      if (convoId && state.byId[convoId]) {
        state.byId[convoId].isUserValidToRply = true;
      }
    },
    setReadConvoMessages: (state, action) => {
      const { convoId, messageOnReadId } = action.payload;

      state.byId[convoId].lastMessage.read = true;
      state.byId[convoId].lastMessageOnRead = messageOnReadId;
    },
    setLastMessageReadByParticipant: (state, action) => {
      const { userId, convoId } = action.payload;
      const lastMessage = state.byId[convoId].lastMessage;

      if (lastMessage && lastMessage.recipient === userId) {
        state.byId[convoId].lastMessageOnRead = lastMessage._id;
        state.byId[convoId].lastMessage.read = true;
      }

      state.byId[convoId].unreadCount = 0;
    },
    resetConvoState: (state) => {
      state = initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteConversation.fulfilled, (state, action) => {
        const convoId = action.meta.arg;
        state.allIds = state.allIds.filter((id) => id !== convoId);
        delete state.byId[convoId];
      })
      .addCase(deleteConversation.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(findOneConvoUpdate.fulfilled, (state, action) => {
        const newConversation = action.payload?.conversations;

        if (newConversation) {
          const { byId, allIds } = normalizeResponse(newConversation);
          console.log("Succesfully fechecd conversation: ", byId);

          state.byId = { ...byId, ...state.byId };
          state.allIds = [allIds[0], ...state.allIds];
        }
      })
      .addCase(findOneConvoUpdate.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchAllConvoList.pending, (state, action) => {
        const cursor = action.meta.arg.cursor;

        if (cursor) {
          state.isFetchingMore = true;
        } else {
          state.loading = true;
        }

        state.error = null;
      })
      .addCase(fetchAllConvoList.fulfilled, (state, action) => {
        const cursor = action.meta.arg.cursor;
        const { byId, allIds } = normalizeResponse(
          action.payload?.conversations
        );

        state.byId = { ...state.byId, ...byId };
        state.allIds = [...state.allIds, ...allIds];

        if (cursor) {
          state.isFetchingMore = false;
        } else {
          state.loading = false;
        }
      })
      .addCase(fetchAllConvoList.rejected, (state, action) => {
        const cursor = action.meta.arg.cursor;
        if (cursor) {
          state.isFetchingMore = false;
        } else {
          state.loading = false;
        }
        state.error = action.payload as string;
      })
      .addCase(openConversation.pending, (state) => {
        state.error = null;
      })
      .addCase(openConversation.fulfilled, (state, action) => {
        const { byId, allIds } = normalizeResponse(
          action.payload?.conversations
        );

        const isConvoExist = state.allIds.includes(allIds[0]);

        if (!isConvoExist) {
          state.allIds.push(allIds[0]);
          state.byId = { ...state.byId, ...byId };
        }
      })
      .addCase(openConversation.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  dropConversation,
  deleteConvoInUnRead,
  setLatestMessage,
  increamentUnread,
  resetConvoState,
  setConvoToValid,
  setConvoToInvalid,
  addUnreadConvo,
  setReadConvoMessages,
  setLastMessageReadByParticipant,
} = conversationSlice.actions;
export default conversationSlice.reducer;
