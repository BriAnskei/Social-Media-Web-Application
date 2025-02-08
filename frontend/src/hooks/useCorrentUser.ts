import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/users/userSelector"; // Adjust the path

export const useCurrentUser = () => {
  const result = useSelector(selectCurrentUser);
  return result;
};
