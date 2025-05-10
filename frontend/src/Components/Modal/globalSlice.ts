import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import { FetchedUserType } from "../../types/user";
import { ChatWindowType, Conversation } from "../../types/MessengerTypes";

// post states
export interface PostModalState {
  postId: string;
  showPostModal: boolean;
}

export interface PostDataState {
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

// profile states
export interface EditProfileModalState {
  data: FetchedUserType;
  show: boolean;
}

export interface ViewProfileState {
  userData: FetchedUserType;
}

export interface ViewImageState {
  show: boolean;
  src: string;
}

export interface ViewUserFollow {
  show: boolean;
}

export interface ChatWindow {
  chatWWindows: ChatWindowType[];
}

export interface GlobalState {
  postModal: PostModalState;
  postData: PostDataState;
  editPostModal: EditPostModalState;
  deletePostModal: DeletePostModalState;
  viewFollow: ViewUserFollow;
  editProfileModal: EditProfileModalState;
  viewProfile: ViewProfileState;

  // image(profile photos) display modal
  viewImageModal: ViewImageState;

  // chat window
  chatWindow: ChatWindow;
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

  editPostModal: {
    postId: "",
    show: false,
  },
  viewFollow: {
    show: false,
  },
  deletePostModal: {
    postId: "",
    show: false,
  },

  editProfileModal: {
    data: {} as FetchedUserType,
    show: false,
  },

  viewProfile: {
    userData: {} as FetchedUserType,
  },

  viewImageModal: {
    show: false,
    src: "",
  },

  chatWindow: {
    chatWWindows: [],
  },
};

// Create the slice
const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    // post reducers
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

    toggleEditModal: (state, action: PayloadAction<string | null>) => {
      state.editPostModal.show = !state.editPostModal.show;
      state.editPostModal.postId = action.payload || "";
    },
    toggleDeleteModal: (state, action: PayloadAction<string | null>) => {
      state.deletePostModal.show = !state.deletePostModal.show;
      state.deletePostModal.postId = action.payload || "";
    },

    // profile reducers
    openEditProfileModal: (state, action: PayloadAction<FetchedUserType>) => {
      state.editProfileModal.data = action.payload;
      state.editProfileModal.show = true;
    },
    closeEditProfileModal: (state) => {
      state.editProfileModal.show = false;
    },
    viewProfile: (state, action: PayloadAction<FetchedUserType>) => {
      state.viewProfile.userData = action.payload;
    },

    viewImage: (state, action) => {
      const { src } = action.payload;
      state.viewImageModal.show = true;
      state.viewImageModal.src = src;
    },
    viewImageClose: (state) => {
      state.viewImageModal.show = false;
      state.viewImageModal.src = "";
    },
    toggleViewFollow: (state, action) => {
      state.viewFollow.show = !state.viewFollow.show;
    },
    openChatWindow: (
      state,
      action: PayloadAction<Conversation & { currUserId: string }>
    ) => {
      const { _id, participants, createdAt, updatedAt, currUserId } =
        action.payload;

      const userId = participants.find((id) => id !== currUserId);

      if (!userId) throw new Error("No valid participant to open this window");

      const isWindowExisting = state.chatWindow.chatWWindows.findIndex(
        (chtWindow) => chtWindow.convoId === _id
      );

      if (isWindowExisting !== -1) {
      } else {
        const data: ChatWindowType = {
          convoId: _id,
          userId,
          minimized: false,
          createdAt,
          updatedAt,
        };

        state.chatWindow.chatWWindows.push(data);
      }
    },
    closeWindow: (state, action) => {
      const { convoId } = action.payload;

      state.chatWindow.chatWWindows = state.chatWindow.chatWWindows.filter(
        (chat) => chat.convoId !== convoId
      );
    },
    minimizeChat: (state, action) => {
      const { convoId } = action.payload;
      console.log("convo id: ", convoId);

      state.chatWindow.chatWWindows.map((cht) => {
        if (cht.convoId === convoId) {
          cht.minimized = !cht.minimized;
        }
      });
    },
  },
});

// Export actions
export const {
  openPostModal,
  closePostModal,
  viewPost,
  closeEditProfileModal,
  toggleEditModal,
  toggleDeleteModal,

  openEditProfileModal,
  viewProfile,
  toggleViewFollow,

  viewImage,
  viewImageClose,

  openChatWindow,
  closeWindow,
  minimizeChat,
} = globalSlice.actions;
export default globalSlice.reducer;
