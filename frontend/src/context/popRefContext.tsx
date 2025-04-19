import React, { createContext, ReactNode, useState } from "react";

interface PopoverProp {
  show: boolean;
  target: React.MutableRefObject<null>;
  postId: string;
  popOverToggle: (postId: string, target: React.MutableRefObject<null>) => void;
  popOverClose: () => void;
}

interface GlobalContextValue {
  popover: PopoverProp;
}

interface ModalProviderProps {
  children: ReactNode;
}

export const GlobalContext = createContext<GlobalContextValue | undefined>(
  undefined
);

export const GlobalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [popoverData, setPopoverData] = useState<{
    show: boolean;
    postId: string;
    target: React.MutableRefObject<null> | any;
  }>({
    show: false,
    postId: "",
    target: null,
  });

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

  const popOverClose = () => {
    setPopoverData((prev) => ({ ...prev, show: false }));
  };

  const globalContextValue: GlobalContextValue = {
    popover: {
      show: popoverData.show,
      target: popoverData.target,
      postId: popoverData.postId,
      popOverToggle,
      popOverClose,
    },
  };

  return (
    <GlobalContext.Provider value={globalContextValue}>
      {children}
    </GlobalContext.Provider>
  );
};
