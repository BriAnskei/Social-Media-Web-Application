import "./UserPosts.css";
import Post from "../Post/Post";
import Spinner from "../../../Components/Spinner/Spinner";

import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { fetchUserPost, resetUsersPosts } from "../postSlice";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";

interface PostProp {
  userId: string;
  dispatch: AppDispatch;
}

const UserPosts = ({ userId, dispatch }: PostProp) => {
  const { loading, fetchingMore, userPostById, userPostIds, hasMoreUserPost } =
    useSelector((state: RootState) => state.posts);

  const lastPostIndex = useMemo(() => userPostIds.length - 1, [userPostIds]);

  useEffect(() => {
    const initialFetch = async () => {
      try {
        await dispatch(fetchUserPost({ userId }));

        window.scrollTo({
          top: 0,
          behavior: "instant",
        });
      } catch (error) {
        console.log("Failed to initial fetch: ", error);
      }
    };
    initialFetch();
    return () => {
      dispatch(resetUsersPosts());
    };
  }, [userId]);

  const fetchMore = async () => {
    try {
      const cursor: string =
        userPostById[userPostIds[userPostIds.length - 1]].createdAt;

      await dispatch(fetchUserPost({ userId, cursor }));
    } catch (error) {
      console.log("Failed to fetch more: ", error);
    }
  };

  const lastPostRef = useInfiniteScroll(
    fetchMore,
    hasMoreUserPost,
    fetchingMore
  );

  return (
    <div className="postlist-container">
      {loading ? (
        <Spinner />
      ) : userPostIds && userPostIds.length > 0 ? (
        userPostIds.map((id, index) => {
          const post = userPostById[id];

          return (
            <div
              key={id}
              ref={index === lastPostIndex ? lastPostRef : undefined}
            >
              <Post post={post} />
            </div>
          );
        })
      ) : (
        <div>No uploaded post</div>
      )}

      {fetchingMore && <Spinner />}
    </div>
  );
};

export default UserPosts;
