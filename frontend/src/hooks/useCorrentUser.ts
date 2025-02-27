import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/users/userSelector";
export const useCurrentUser = () => {
  const result = useSelector(selectCurrentUser);
  return result;
};
