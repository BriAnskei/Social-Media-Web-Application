import "./Viewpost.css";
import { AppDispatch } from "../../../store/store";
import { fetchComments } from "../postSlice";

interface CommentsFetcherProp {
  hasMore: boolean;
  postId: string;
  cursor: string;
  setHasMore: (n: boolean) => void;
  setCursor: (n: string) => void;
  dispatch: AppDispatch;
  scrollRef: React.RefObject<HTMLElement>;
  lastScrollRef: React.MutableRefObject<number>;
}

const ViewPostCommentFetcher = ({
  hasMore,
  postId,
  cursor,
  setHasMore,
  setCursor,
  dispatch,
  scrollRef,
  lastScrollRef,
}: CommentsFetcherProp) => {
  const fetchMore = async () => {
    try {
      console.log("FETCHING MORE COMMENTS IN VIEWEPOSER");

      if (!scrollRef.current) {
        console.error("Scroll element is not initialize");
        return;
      }

      const scrollElement = scrollRef.current;
      lastScrollRef.current = scrollElement?.scrollHeight;

      const res = await dispatch(fetchComments({ postId, cursor })).unwrap();
      const { hasMore, nextCursor } = res!;

      console.log(
        "Fectch more comment res",
        hasMore,
        " next cursor: ",
        nextCursor
      );

      setCursor(nextCursor);
      setHasMore(hasMore);

      // adjust scrollPosition
      setNewSrollHeight(scrollElement);
    } catch (error) {
      console.log("fetchMore-comment, ", error);
    }

    function setNewSrollHeight(scrollElement: HTMLElement) {
      setTimeout(() => {
        const newHeight = scrollElement.scrollHeight;
        scrollElement.scrollTop = newHeight - lastScrollRef.current;
      }, 0);
    }
  };

  return (
    <>
      {hasMore && (
        <div className="viewPost-comment-fetcher" onClick={fetchMore}>
          <span> View more....</span>
        </div>
      )}
    </>
  );
};

export default ViewPostCommentFetcher;
