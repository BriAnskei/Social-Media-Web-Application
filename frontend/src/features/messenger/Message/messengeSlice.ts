import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Message, SentMessagePayload } from "../../../types/MessengerTypes";
import { MessageNormalizeSate } from "../../../types/NormalizeType";

import { RootState } from "../../../store/store";
import { MessageApi } from "../../../utils/api";

const initialState: MessageNormalizeSate = {
  byId: {},
  allIds: [],
  error: null,
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

      console.log("message data in slice: ", data);

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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesByConvoId.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(sentMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  // reducer functions
} = messengerSlice.actions;
export default messengerSlice.reducer;
