import React, { createContext, ReactNode, useState } from "react";
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
  popOverToggle: (
    data: FetchPostType,
    target: React.MutableRefObject<null>
  ) => void;
}

interface GlobalContextValue {
  postModal: PostModalTypes;
  postData: ViewPost;
  popover: PopoverProp;
}

interface ModalProviderProps {
  children: ReactNode;
}

export const GlobalContext = createContext<GlobalContextValue | undefined>(
  undefined
);

export const GlobalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [postId, setPostId] = useState(""); // for view post(latest post) component

  const [popoverData, setPopoverData] = useState<{
    show: boolean;
    target: React.MutableRefObject<null> | any;
  }>({
    show: false,
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

  // popover
  const popOverToggle = (
    data: FetchPostType,
    target: React.MutableRefObject<null>
  ) => {
    setPopoverData((prev) => ({ ...prev, target: target, show: !prev.show }));
    console.log("Data: ", data);
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
      popOverToggle,
    },
  };

  return (
    <GlobalContext.Provider value={globalContextValue}>
      {children}
    </GlobalContext.Provider>
  );
};
