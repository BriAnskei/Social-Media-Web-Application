import { useContext } from "react";
import { GlobalContext } from "../context/GlobalContext";

export const useModal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("No context in the modalContext");
  return context;
};
