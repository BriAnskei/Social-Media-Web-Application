import "./CurrentUserPost.css";
import Post from "../Post/Post";
import Spinner from "../../../Components/Spinner/Spinner";
import { useCurrentUserPosts } from "../../../hooks/usePost";
import { useCurrentUser } from "../../../hooks/useUsers";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchAllPost } from "../postSlice";
import { AppDispatch } from "../../../store/store";

const CurrentUserPosts = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currentUserPosts, loading } = useCurrentUserPosts();

  const { currentUser } = useCurrentUser();

  useEffect(() => {
    dispatch(fetchAllPost());
  }, [dispatch]);

  return (
    <>
      <div className="postlist-container">
        {loading ? (
          <Spinner />
        ) : currentUserPosts ? (
          currentUserPosts.map((post) => (
            <div key={post._id}>
              <Post post={post} ownerId={currentUser._id} />
            </div>
          ))
        ) : (
          <div>Write a post</div>
        )}
      </div>
    </>
  );
};

export default CurrentUserPosts;
