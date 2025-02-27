import { useSelector } from "react-redux";
import { selectCurrentUserPost } from "../features/posts/postSelector";

export const useCurrentUserPosts = () => {
  const result = useSelector(selectCurrentUserPost);
  return result;
};
