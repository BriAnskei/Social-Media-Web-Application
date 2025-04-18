import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define state types
export interface PostModalState {
  postId: string;
  showPostModal: boolean;
}

export interface PostDataState {
  postId: string;
}

export interface PopoverState {
  show: boolean;
  postId: string;
}

export interface EditPostModalState {
  postId: string;
  show: boolean;
}

export interface DeletePostModalState {
  postId: string;
  show: boolean;
}

export interface GlobalState {
  postModal: PostModalState;
  postData: PostDataState;
  popover: PopoverState;
  editPostModal: EditPostModalState;
  deletePostModal: DeletePostModalState;
}

// Initialize state
const initialState: GlobalState = {
  postModal: {
    postId: "",
    showPostModal: false,
  },
  postData: {
    postId: "",
  },
  popover: {
    show: false,
    postId: "",
  },
  editPostModal: {
    postId: "",
    show: false,
  },
  deletePostModal: {
    postId: "",
    show: false,
  },
};

// Define payload types for actions that need complex data
interface PopoverTogglePayload {
  postId: string;
}

interface PopoverEventMenuPayload {
  postId: string;
  eventType: string;
}

// Create the slice
const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    openPostModal: (state, action: PayloadAction<string>) => {
      state.postModal.showPostModal = true;
      state.postModal.postId = action.payload;
    },
    closePostModal: (state) => {
      state.postModal.showPostModal = false;
    },
    viewPost: (state, action: PayloadAction<string>) => {
      if (!action.payload) throw new Error("Error: No Id received");
      state.postData.postId = action.payload;
    },
    popOverToggle: (state, action: PayloadAction<PopoverTogglePayload>) => {
      console.log("popover toggled:", action.payload);
      const { postId } = action.payload;
      const currentShow = state.popover.show;
      const currenetPostId = state.popover.postId;

      // Logic matching the original context implementation
      if (postId && currentShow) {
        if (postId !== currenetPostId) {
          state.popover.postId = postId;
        } else {
          state.popover.postId = "";
          state.popover.show = false;
        }
      } else {
        state.popover.show = true;
        state.popover.postId = postId;
      }
    },
    closePopover: (state) => {
      state.popover.show = false;
    },
    toggleEditModal: (state, action: PayloadAction<string | null>) => {
      console.log("toggle edit: ", action.payload);
      state.editPostModal.show = !state.editPostModal.show;
      state.editPostModal.postId = action.payload || "";
    },
    toggleDeleteModal: (state, action: PayloadAction<string | null>) => {
      state.deletePostModal.show = !state.deletePostModal.show;
      state.deletePostModal.postId = action.payload || "";
    },
  },
});

// Export actions
export const {
  openPostModal,
  closePostModal,
  viewPost,
  popOverToggle,
  closePopover,
  toggleEditModal,
  toggleDeleteModal,
} = globalSlice.actions;
export default globalSlice.reducer;
