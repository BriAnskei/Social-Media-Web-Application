import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ContactType } from "../../../types/contactType";
import { NormalizeState } from "../../../types/NormalizeType";
import { RootState } from "../../../store/store";
import { MessageApi } from "../../../utils/api";
import normalizeResponse from "../../../utils/normalizeResponse";

interface Contactstate extends NormalizeState<ContactType> {}

const initialState: Contactstate = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
};

export const fetchAllContact = createAsyncThunk(
  "contact/get",
  async (_: void, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.accessToken;

      if (!token) {
        return rejectWithValue("no accessToken to validate this request");
      }

      const res = await MessageApi.contacts.getAllContact(token);

      return res;
    } catch (error) {
      rejectWithValue("Failed to fetct contacts, " + error);
    }
  }
);

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    createOrUpdateContact: (
      state,
      action: PayloadAction<{ contact: ContactType; isContactExist: boolean }>
    ) => {
      const { contact } = action.payload;
      const { allIds, byId } = normalizeResponse(contact);
      const isContactExist = state.allIds.includes(allIds[0]);

      if (isContactExist) {
        state.byId[contact._id].validFor = contact.validFor;
      } else {
        state.allIds.push(allIds[0]);
        state.byId = { ...state.byId, ...byId };
      }

      // Short emplementation
      // // If new, record the ID
      // if (!isContactExist) {
      //   state.allIds.push(allIds[0]);
      // }

      // // Always merge in the fresh data
      // Object.assign(state.byId, byId);
    },
    updateOrDeleteContact: (state, action) => {
      const { contactId } = action.payload;

      state.allIds = state.allIds.filter((id) => id !== contactId);
      delete state.byId[contactId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllContact.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllContact.fulfilled, (state, action) => {
        const { allIds, byId } = normalizeResponse(action.payload?.contacts);

        state.allIds = allIds;
        state.byId = { ...byId };
        state.loading = false;
      })
      .addCase(fetchAllContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { createOrUpdateContact, updateOrDeleteContact } =
  contactSlice.actions;
export default contactSlice.reducer;
