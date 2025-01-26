import { useEffect } from "react";

import "./PostList.css";
import Post from "../Post/Post";
import { AppDispatch, RootState } from "../../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { getPosts } from "../postSlice";
import { FetchPostType } from "../../../types/PostType";

const PostList = () => {
  const dispatch: AppDispatch = useDispatch();
  const posts: FetchPostType[] = useSelector(
    (state: RootState) => state.posts.posts
  );
  const isLoading = useSelector((state: RootState) => state.posts.loading);

  useEffect(() => {
    dispatch(getPosts());
  }, []);

  return (
    <>
      <div className="postlist-container">
        {isLoading ? (
          <>Loading...</>
        ) : (
          posts.map((post, index) => (
            <div key={index}>
              <Post post={post} />
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default PostList;
