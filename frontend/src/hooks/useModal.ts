import { useContext } from "react";
import { GlobalContext } from "../context/popRefContext";

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("No context in the modalContext");
  return context;
};
