import { useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectUserById,
  selectUsersByIds,
} from "../features/users/userSelector";
import { RootState } from "../store/store";

export const useCurrentUser = () => {
  const result = useSelector(selectCurrentUser);
  return result;
};

// for user data per comment(Post), returns a single object data of users
export const useUserById = (userId: string) => {
  const data = useSelector((state: RootState) => selectUserById(state, userId));
  return data;
};

export const useUsersById = (usersIds: string[]) => {
  const data = useSelector((state: RootState) =>
    selectUsersByIds(state, usersIds)
  );
  return data;
};
