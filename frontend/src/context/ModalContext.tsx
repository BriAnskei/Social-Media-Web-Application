import { Children, createContext, ReactNode, useState } from "react";
import { FetchPostType } from "../types/PostType";

interface PostModalTypes {
  postData: FetchPostType;
  showPostModal: boolean;
  openPostModal: (data: FetchPostType) => void;
  onClosePostModal: () => void;
}

interface ModalContextValue {
  postModal: PostModalTypes;
}

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalContext = createContext<ModalContextValue | undefined>(
  undefined
);

const postDefault: FetchPostType = {
  _id: "",
  user: "",
  content: "",
  image: undefined,
  likes: [],
  comments: [],
  createdAt: "",
};

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [postModalData, setPostModalData] = useState<{
    showModal: boolean;
    data: FetchPostType;
  }>({
    showModal: false,
    data: postDefault,
  });

  // SHoww post Modal
  const openPostModal = (data: FetchPostType) => {
    setPostModalData((prev) => {
      return {
        ...prev,
        showModal: !prev.showModal,
        data: data,
      };
    });
  };
  const onClosePostModal = () => {
    setPostModalData((prev) => {
      return {
        ...prev,
        showModal: !prev.showModal,
        data: postDefault,
      };
    });
  };

  const modalContextValue: ModalContextValue = {
    postModal: {
      postData: postModalData.data,
      showPostModal: postModalData.showModal,
      openPostModal,
      onClosePostModal,
    },
  };

  return (
    <ModalContext.Provider value={modalContextValue}>
      {children}
    </ModalContext.Provider>
  );
};
