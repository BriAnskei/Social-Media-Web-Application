import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";

const usePostOwner = (userId: string) => {
  const dispatch: AppDispatch = useDispatch();
};

export default usePostOwner;
