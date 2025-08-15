import "./PostList.css";
import Post from "../Post/Post";

import Spinner, { MessageSpinner } from "../../../Components/Spinner/Spinner";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { usePosts } from "../../../hooks/usePost";
import { useScrollResoration } from "../../../hooks/useScrollRestoration";

const PostList = () => {
  const { posts, postIds, loading, fetchingMore, hasMore, fetchPosts } =
    usePosts();

  const fetchMorePosts = () => {
    const lastPost = posts[postIds[postIds.length - 1]];
    if (lastPost) {
      fetchPosts(lastPost.createdAt);
    }
  };

  const lastPostRef = useInfiniteScroll(fetchMorePosts, hasMore, fetchingMore);
  useScrollResoration();

  return (
    <>
      <div className="postlist-container">
        {loading ? (
          <Spinner />
        ) : (
          postIds.map((postId, index) => {
            const post = posts[postId];
            const isLastPost: boolean = index === postIds.length - 1;

            return (
              <div key={postId} ref={isLastPost ? lastPostRef : undefined}>
                <Post post={post} />
              </div>
            );
          })
        )}
        {/* Fetching more loading */}
        {fetchingMore && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "8px 0",
            }}
          >
            <MessageSpinner />
          </div>
        )}
      </div>
    </>
  );
};

export default PostList;
