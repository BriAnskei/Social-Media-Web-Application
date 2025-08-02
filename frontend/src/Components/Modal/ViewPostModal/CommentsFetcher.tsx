import "./ViewPostModal.css";

import { AppDispatch } from "../../../store/store";
import { CommentType } from "../../../types/PostType";
import { useEffect, useRef, useState } from "react";
import { fetchComments } from "../../../features/comment/commentSlice";

interface CommentsFetcherProp {
  hasMore: boolean;
  postId: string;
  dispatch: AppDispatch;
  scrollRef: React.RefObject<HTMLElement>;
  loading: boolean;
  comments: CommentType[];
}

const CommentsFetcher = ({
  hasMore,
  dispatch,
  scrollRef,
  postId,
  loading,

  comments,
}: CommentsFetcherProp) => {
  const lastScrollRef = useRef<number>(0);
  const fetchMore = async () => {
    try {
      if (!scrollRef.current) {
        console.error("Scroll element is not initialize");
        return;
      }

      const scrollElement = scrollRef.current;
      lastScrollRef.current = scrollElement?.scrollHeight;

      await dispatch(
        fetchComments({
          postId,
          cursor: comments[0].createdAt,
        })
      );

      adjustScrollView(scrollElement);
    } catch (error) {
      console.log("fetchMore-comment, ", error);
    }

    function adjustScrollView(scrollElement: HTMLElement) {
      setTimeout(() => {
        const newHeight = scrollElement.scrollHeight;
        scrollElement.scrollTop = newHeight - lastScrollRef.current;
      }, 0);
    }
  };

  return (
    <>
      {hasMore && !loading && (
        <div className="comment-fetcher" onClick={fetchMore}>
          <span> View more....</span>
        </div>
      )}
    </>
  );
};

export default CommentsFetcher;
