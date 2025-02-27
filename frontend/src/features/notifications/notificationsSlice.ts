import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { exampleNotifications } from "../../assets/assets";
import { notificationApi } from "../../utils/api";
import { NormalizeState } from "../../types/NormalizeType";
import normalizeResponse from "../../utils/normalizeResponse";

export interface NotifData {
  _id: string;
  receiver: string;
  sender: string;
  post: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState extends NormalizeState<NotifData> {}

const initialState: NotificationState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotifData>): void => {
      const data = normalizeResponse(action.payload);

      state.byId = { ...state.byId, ...data.byId };
      if (!state.allIds.includes(data.allIds[0])) {
        state.allIds.push(data.allIds[0]);
      }
    },
  },
  extraReducers: (builder) => {
    builder;
  },
});

export default notificationSlice.reducer;
