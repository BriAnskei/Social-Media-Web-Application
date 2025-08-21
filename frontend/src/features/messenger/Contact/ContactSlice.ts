import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ContactType } from "../../../types/contactType";
import { NormalizeState } from "../../../types/NormalizeType";
import { RootState } from "../../../store/store";
import { MessageApi } from "../../../utils/api";
import { normalizeResponse } from "../../../utils/normalizeResponse";

interface Contactstate extends NormalizeState<ContactType> {
  searchedIds: string[];
  filterByIds: { [key: string]: ContactType };
  filterLoading: boolean;
  hasFilter: boolean;
  hasMore: boolean;
  fetchingMore: boolean;
}

const initialState: Contactstate = {
  byId: {},
  allIds: [],
  loading: false,
  filterLoading: false,
  hasFilter: false,
  error: null,
  searchedIds: [],
  filterByIds: {},
  hasMore: false,
  fetchingMore: false,
};

export const fetchAllContact = createAsyncThunk(
  "contact/get",
  async (payload: { cursor?: Date }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.accessToken;
      console.log("fetching ontacs");

      if (!token) {
        return rejectWithValue("no accessToken to validate this request");
      }

      const res = await MessageApi.contacts.getAllContact({
        token,
        cursor: payload.cursor,
      });

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
    resetContact: () => {
      return initialState;
    },
    hasSearch: (state, action) => {
      state.hasFilter = action.payload;
    },
    filterLoading: (state, action) => {
      state.filterLoading = action.payload;
    },
    filterContacts: (state, action) => {
      const { byId, allIds } = normalizeResponse(action.payload);
      state.searchedIds = allIds;
      state.filterByIds = byId;
    },
    clearFilter: (state) => {
      state.searchedIds = [];
      state.filterByIds = {};
    },
    createOrUpdateContact: (
      state,
      action: PayloadAction<{ contact: ContactType }>
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
    },
    deleteContact: (state, action) => {
      const { contactId } = action.payload;

      state.allIds = state.allIds.filter((id) => id !== contactId);
      delete state.byId[contactId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllContact.pending, (state, action) => {
        if (action.meta.arg.cursor) {
          state.fetchingMore = true;
        } else {
          state.loading = true;
        }
      })
      .addCase(fetchAllContact.fulfilled, (state, action) => {
        const { allIds, byId } = normalizeResponse(action.payload?.contacts);

        state.allIds = [...state.allIds, ...allIds];
        state.byId = { ...state.byId, ...byId };
        state.hasMore = action.payload?.hasMore ?? false;
        state.loading = false;
        state.fetchingMore = false;
      })
      .addCase(fetchAllContact.rejected, (state, action) => {
        state.loading = false;
        state.fetchingMore = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  createOrUpdateContact,
  deleteContact,
  filterContacts,
  filterLoading,
  hasSearch,
  clearFilter,
  resetContact,
} = contactSlice.actions;
export default contactSlice.reducer;
