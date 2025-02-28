import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NormalizeState } from "../../types/NormalizeType";
import normalizeResponse from "../../utils/normalizeResponse";
import { NotificationType } from "../../types/NotificationTypes";
import { RootState } from "../../store/store";
import { notificationApi } from "../../utils/api";

export interface NotifData {
  isExist: boolean;
  data: NotificationType;
}

interface NotificationState extends NormalizeState<NotificationType> {}

const initialState: NotificationState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
};

export const fetchAllNotifs = createAsyncThunk(
  "notification/get",
  async function name(_: void, { getState }) {
    const { auth } = getState() as RootState;
    const accessToken = auth.accessToken;

    console.log("Ftehcing notif triggered", accessToken);

    if (!accessToken) throw new Error("Access token is required");

    try {
      const res = await notificationApi.fetchAllNotif(accessToken);

      console.log(res);

      if (!res.success) {
        console.error("Notif fetching error: ", res.message);
        return;
      }

      return res.notifications;
    } catch (error) {
      console.error("Notif fetching error: ", error);
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotifData>): void => {
      const { isExist, data } = action.payload;
      const { byId, allIds } = normalizeResponse(data);
      console.log("recieved data: ", byId, allIds);

      console.log("State before: ", { ...state.byId }, [...state.allIds]);

      if (!isExist) {
        if (!state.allIds.includes(allIds[0])) {
          state.allIds.push(allIds[0]);
        }
        state.byId = { ...state.byId, ...byId };
      } else {
        state.allIds = [...state.allIds.filter((id) => id !== allIds[0])];
        delete state.byId[allIds[0]];
      }
      console.log("State after: ", { ...state.byId }, [...state.allIds]);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllNotifs.pending, (state) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(fetchAllNotifs.fulfilled, (state, action) => {
        const NotifData = normalizeResponse(action.payload);

        // reset first
        state.allIds = [];
        state.byId = {};
        state.allIds = NotifData.allIds;
        state.byId = NotifData.byId;
        state.error = null;
        state.loading = false;

        console.log("Fetchet notifs: ", state.allIds, state.byId);
      })
      .addCase(fetchAllNotifs.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
