import { useEffect, useRef } from "react";

import "./PostList.css";
import Post from "../Post/Post";
import { AppDispatch, RootState } from "../../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPost } from "../postSlice";
import Spinner from "../../../Components/Spinner/Spinner";

const PostList = () => {
  const dispatch: AppDispatch = useDispatch();
  const posts = useSelector((state: RootState) => state.posts.byId);
  const postIds = useSelector((state: RootState) => state.posts.allIds);
  const postLoading = useSelector((state: RootState) => state.posts.loading);
  const userLodaing = useSelector((state: RootState) => state.user.loading);
  const { accessToken, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const test = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchAllPost());
    };

    if (accessToken && isAuthenticated) {
      fetchData();
    }
  }, []);

  return (
    <>
      <div className="postlist-container" ref={test}>
        {postLoading || userLodaing ? (
          <Spinner />
        ) : (
          postIds.map((postId) => {
            const post = posts[postId];

            return (
              <div key={postId}>
                <Post post={post} ownerId={post.user} />
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default PostList;
