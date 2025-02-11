import { useEffect } from "react";

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
  const user = useSelector((state: RootState) => state.user.byId);

  console.log(posts);

  useEffect(() => {
    dispatch(fetchAllPost());
  }, []);

  return (
    <>
      <div className="postlist-container">
        {postLoading || userLodaing ? (
          <Spinner />
        ) : (
          postIds.map((postId) => {
            const post = posts[postId];
            const postOwner = user[post.user];
            return (
              <div key={postId}>
                <Post post={post} user={postOwner} />
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default PostList;
