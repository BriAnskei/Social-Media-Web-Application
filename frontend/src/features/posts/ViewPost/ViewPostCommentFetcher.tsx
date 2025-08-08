import "./Viewpost.css";
import { AppDispatch } from "../../../store/store";
import { CommentType } from "../../../types/PostType";
import { useCallback, useState } from "react";
import { fetchComments } from "../../comment/commentSlice";

interface CommentsFetcherProp {
  loading: boolean;
  hasMore: boolean;
  postId: string;
  comments: CommentType[];
  dispatch: AppDispatch;
  scrollRef: React.RefObject<HTMLElement>;
  lastScrollRef: React.MutableRefObject<number>;
}

const ViewPostCommentFetcher = ({
  loading,
  hasMore,
  postId,
  comments,
  dispatch,
  scrollRef,
  lastScrollRef,
}: CommentsFetcherProp) => {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const fetchMore = useCallback(async () => {
    try {
      console.log("FETCHING MORE");

      setIsFetching(true);
      if (!scrollRef.current) {
        console.error("Scroll element is not initialize");
        return;
      }

      const scrollElement = scrollRef.current;
      lastScrollRef.current = scrollElement?.scrollHeight;

      await dispatch(fetchComments({ postId, cursor: comments[0].createdAt }));

      // adjust scrollPosition
      setNewSrollHeight(scrollElement);
    } catch (error) {
      console.log("fetchMore-comment, ", error);
    } finally {
      setIsFetching(false);
    }
  }, [postId, comments]);

  function setNewSrollHeight(scrollElement: HTMLElement) {
    setTimeout(() => {
      const newHeight = scrollElement.scrollHeight;
      scrollElement.scrollTop = newHeight - lastScrollRef.current;
    }, 0);
  }

  return (
    <>
      {!loading && !isFetching && hasMore && (
        <div className="viewPost-comment-fetcher" onClick={fetchMore}>
          <span> View more....</span>
        </div>
      )}
    </>
  );
};

export default ViewPostCommentFetcher;
