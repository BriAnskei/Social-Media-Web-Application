import { useContext } from "react";
import { PopoverContext, PopoverContextValue } from "../context/popRefContext";

export const usePopoverContext = (): PopoverContextValue => {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error("PopoverContext must be initialize");
  }

  return context;
};
