import "./ViewPostModal.css";
import { useEffect, useRef, useState } from "react";
import { FetchedUserType } from "../../../types/user";
import { usePostById } from "../../../hooks/usePost";

import { AppDispatch } from "../../../store/store";
import { userProfile } from "../../../utils/ImageUrlHelper";
import CommentsFetcher from "./Commentsfetcher";

interface CommentListProp {
  postId: string;
  viewUserProfile: (user: FetchedUserType) => void;
  dispatch: AppDispatch;
}

const CommentList = ({
  postId,
  viewUserProfile,
  dispatch,
}: CommentListProp) => {
  const { postData, fetchCommentLoading } = usePostById(postId);

  const { comments, hasMoreComments } = postData;

  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState("");

  // scroll handler ref
  const scrollRef = useRef<any>(null);
  const lastScrollRef = useRef<number>(0);

  // on comment smooth scroll effect
  const buttonRef = useRef<any>(null);

  useEffect(() => {
    // set the last scroll height in the first render
    const scrollElement = scrollRef.current;
    lastScrollRef.current = scrollElement?.scrollHeigt;

    setCursor(postData?.comments[0]?.createdAt);
    setHasMore(hasMoreComments);
  }, [postId]);

  useEffect(() => {
    buttonRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  return (
    <>
      <div className="comment-list-container" ref={scrollRef}>
        <CommentsFetcher
          scrollRef={scrollRef}
          lastScrollRef={lastScrollRef}
          dispatch={dispatch}
          hasMore={hasMore}
          postId={postId}
          cursor={cursor}
          setHasMore={setHasMore}
          setCursor={setCursor}
        />

        {/* comment fetch-loading */}
        {fetchCommentLoading && <div>Laoding</div>}

        {!comments || comments.length === 0 ? (
          <>Write a Comment</>
        ) : (
          comments.map((comment, index) => {
            const userData = comment.user as FetchedUserType;

            if (!userData) return;

            return (
              <div className="comment-cont" key={index}>
                <img
                  onClick={() => viewUserProfile(userData)}
                  src={userProfile(userData.profilePicture!, userData._id)}
                  alt=""
                />
                <div className="comment-content">
                  <div className="info-content">
                    <h5
                      onClick={() => viewUserProfile(userData)}
                      style={{ cursor: "pointer" }}
                    >
                      {userData.fullName}
                    </h5>
                    <span>{comment.content}</span>
                  </div>
                  <span id="comment-date">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={buttonRef}></div>
      </div>
    </>
  );
};

export default CommentList;
