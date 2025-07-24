import React from "react";
import "./ViewPostModal.css";

const CommentsFetcher = ({
  hasMore,
  postId,
}: {
  hasMore: boolean;
  postId: string;
}) => {
  const fetchMore = () => {
    console.log("fetch more post for : ", postId);
  };

  return (
    <>
      {hasMore && (
        <div className="comment-fetcher" onClick={fetchMore}>
          <span> view more comments....</span>
        </div>
      )}
    </>
  );
};

export default CommentsFetcher;
