import {
  createAsyncThunk,
  createSlice,
  current,
  PayloadAction,
} from "@reduxjs/toolkit";
import { Message, SentMessagePayload } from "../../../types/MessengerTypes";
import { MessageNormalizeSate } from "../../../types/NormalizeType";

import { RootState } from "../../../store/store";
import { MessageApi } from "../../../utils/api";

const initialState: MessageNormalizeSate = {
  byId: {},
  hasMore: {},
  loading: {},
  error: {},
};

// might also user user Id as a prop to fetch all messages
export const fetchMessagesByConvoId = createAsyncThunk(
  "message/getMesseges",
  async (
    {
      conversationId,
      cursor,
    }: { conversationId: string; cursor: string | null },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.accessToken;

      if (!token) {
        return rejectWithValue("Failed to fetch messages: No token");
      }

      const res = await MessageApi.message.getMessagesByConvorsationId(
        conversationId,
        cursor,
        token
      );

      const { messages, hasMore } = res;
      return { messages, hasMore };
    } catch (error) {
      rejectWithValue("Failed to fetch messages,  " + error);
    }
  }
);

export interface MessagePayloadContent {
  messageContent: FormData;
  payLoad: SentMessagePayload;
}

export const sentMessage = createAsyncThunk(
  "message/sent",
  async (data: Message, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.accessToken;

      if (!token) {
        return rejectWithValue("Failed to sent message: No token");
      }

      const res = await MessageApi.message.sentMessage(token, data);

      return res.messages as Message;
    } catch (error) {
      rejectWithValue("Failed to sent message, " + error);
    }
  }
);

const messengerSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    addMessage: (
      state,
      action: PayloadAction<{ conversationId: string; messageData: Message }>
    ) => {
      const { conversationId, messageData } = action.payload;

      if (!state.byId[conversationId]) {
        state.byId[conversationId] = [];
      }
      state.byId[conversationId] = [...state.byId[conversationId], messageData];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesByConvoId.pending, (state, action) => {
        const convoId = action.meta.arg.conversationId;

        state.loading[convoId] = true;
      })
      .addCase(fetchMessagesByConvoId.fulfilled, (state, action) => {
        const convoId = action.meta.arg.conversationId;

        const messages = action.payload?.messages as Message[];
        const hasMore = action.payload?.hasMore;

        if (!state.byId[convoId]) {
          state.byId[convoId] = [];
        }

        state.loading[convoId] = false;
        state.byId[convoId] = [...messages.reverse(), ...state.byId[convoId]];
        state.hasMore[convoId] = hasMore as boolean;

        console.log(
          "State not in slice: ",
          current(state.loading),
          current(state.byId),
          current(state.hasMore)
        );
      })
      .addCase(fetchMessagesByConvoId.rejected, (state, action) => {
        const convoId = action.meta.arg.conversationId;
        state.error[convoId] = action.payload as string;
        state.loading[convoId] = false;
      })
      .addCase(sentMessage.rejected, (state, action) => {
        const convoId = action.meta.arg.conversationId;
        state.error[convoId] = action.payload as string;
      });
  },
});

export const { addMessage } = messengerSlice.actions;
export default messengerSlice.reducer;
