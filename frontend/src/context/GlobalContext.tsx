import React, { createContext, ReactNode, useEffect, useState } from "react";
import { FetchPostType } from "../types/PostType";

interface PostModalTypes {
  postId?: string;
  showPostModal: boolean;
  openPostModal: (postId: string) => void;
  onClosePostModal: () => void;
}

interface ViewPost {
  viewPost: (post: string) => void;
  postId: string;
}

interface PopoverProp {
  show: boolean;
  target: React.MutableRefObject<null>;
  postId: string;
  popOverToggle: (postId: string, target: React.MutableRefObject<null>) => void;
  popoverEventMenu: (id: string, type: string) => void;
}

interface EditPostModal {
  postId: string;
  show: boolean;
  toggleEditModal: (postId: string | null) => void;
}

interface DeletePostModal {
  postId: string;
  show: boolean;
  toggleDeleteModal: (postId: string | null) => void;
}

interface GlobalContextValue {
  postModal: PostModalTypes;
  postData: ViewPost;
  popover: PopoverProp;
  editPostModal: EditPostModal;
  deletePostModal: DeletePostModal;
}

interface ModalProviderProps {
  children: ReactNode;
}

export const GlobalContext = createContext<GlobalContextValue | undefined>(
  undefined
);

export const GlobalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [postId, setPostId] = useState(""); // for view post(latest post) component

  const [postEditModal, setPostEditModal] = useState<{
    postId: string;
    show: boolean;
  }>({
    postId: "",
    show: false,
  });

  const [deletePostData, setDeletePostData] = useState({
    postId: "",
    show: false,
  });

  const [popoverData, setPopoverData] = useState<{
    show: boolean;
    postId: string;
    target: React.MutableRefObject<null> | any;
  }>({
    show: false,
    postId: "",
    target: null,
  });

  const [postModalData, setPostModalData] = useState<{
    showModal: boolean;
    postId: string;
  }>({
    showModal: false,
    postId: "",
  });

  // SHoww post Modal
  const openPostModal = (postId: string) => {
    setPostModalData((prev) => {
      return {
        ...prev,
        showModal: true,
        postId: postId,
      };
    });
  };
  const onClosePostModal = () => {
    setPostModalData((prev) => {
      return {
        ...prev,
        showModal: false,
      };
    });
  };

  const viewPost = (postId: string) => {
    if (!postId) throw new Error("Error: No Id recieved");
    setPostId(postId);
  };

  // Popover events
  const popOverToggle = (
    postId: string,
    target: React.MutableRefObject<null>
  ) => {
    if (target.current && popoverData.show) {
      if (target.current !== popoverData.target.current) {
        setPopoverData((prev) => ({ ...prev, target: target, postId }));
      } else {
        setPopoverData((prev) => ({ ...prev, show: !prev.show, postId: "" }));
      }
    } else {
      setPopoverData((prev) => ({
        ...prev,
        target: target,
        show: !prev.show,
        postId,
      }));
    }
  };
  const popoverEventMenu = (postId: string, type: string) => {
    switch (type) {
      case "edit":
        toggleEditModal(postId);

        break;
      case "delete":
        toggleDeleteModal(postId);
        break;
      default:
        return type;
    }
    setPopoverData((prev) => ({ ...prev, show: false }));
  };

  // Edit Post Modal
  const toggleEditModal = (postId: string | null) => {
    setPostEditModal((prev) => ({
      ...prev,
      show: !prev.show,
      postId: postId ? postId : "",
    }));
  };

  const toggleDeleteModal = (postId: string | null) => {
    setDeletePostData((prev) => ({
      ...prev,
      show: !prev.show,
      postId: postId || "",
    }));
    console.log("toggler toggled: ", deletePostData);
  };

  const globalContextValue: GlobalContextValue = {
    postModal: {
      postId: postModalData.postId,
      showPostModal: postModalData.showModal,

      openPostModal,
      onClosePostModal,
    },
    postData: {
      viewPost,
      postId,
    },
    popover: {
      show: popoverData.show,
      target: popoverData.target,
      postId: popoverData.postId,
      popOverToggle,
      popoverEventMenu,
    },
    editPostModal: {
      postId: postEditModal.postId,
      show: postEditModal.show,
      toggleEditModal,
    },
    deletePostModal: {
      postId: deletePostData.postId,
      show: deletePostData.show,
      toggleDeleteModal,
    },
  };

  return (
    <GlobalContext.Provider value={globalContextValue}>
      {children}
    </GlobalContext.Provider>
  );
};
