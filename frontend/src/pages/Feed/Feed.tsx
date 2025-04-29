import "./Feed.css";
import PostList from "../../features/posts/PostList/PostList";
import { useEffect } from "react";

const Feed = () => {
  // scroll to top when render
  useEffect(() => {
    if (window.pageYOffset > 0) {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="feed-container">
      <PostList />
    </div>
  );
};

export default Feed;
