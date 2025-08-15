import "./ViewPostModal.css";
import { useEffect, useRef, useState } from "react";
import { FetchedUserType } from "../../../types/user";

import { AppDispatch } from "../../../store/store";
import { userProfile } from "../../../utils/ImageUrlHelper";

import { useComment } from "../../../hooks/useComment";
import { fetchComments } from "../../../features/comment/commentSlice";
import CommentsFetcher from "./CommentsFetcher";
import { MessageSpinner } from "../../Spinner/Spinner";

interface CommentListProp {
  postId: string;
  viewUserProfile: (user: FetchedUserType) => void;
  dispatch: AppDispatch;
  modalOnShow: boolean;
  totalComments: number;
}

const CommentList = ({
  postId,
  viewUserProfile,
  dispatch,
  modalOnShow,
  totalComments,
}: CommentListProp) => {
  const { comments, hasMore, loading, err } = useComment(postId);

  // scroll handler ref
  const scrollRef = useRef<any>(null);
  // on comment smooth scroll effect
  const buttonRef = useRef<any>(null);

  const prevCommentLenght = useRef<number>(0);

  useEffect(() => {
    const fetchInitialComments = async () => {
      try {
        if (modalOnShow && totalComments > 0) {
          await dispatch(fetchComments({ postId }));
        }
      } catch (error) {
        console.log(err, error);
      }
    };

    fetchInitialComments();
  }, [postId, modalOnShow]);

  scrollHanlder();

  return (
    <>
      <div className="comment-list-container" ref={scrollRef}>
        <div>
          <CommentsFetcher
            scrollRef={scrollRef}
            loading={loading}
            dispatch={dispatch}
            hasMore={hasMore}
            postId={postId}
            comments={comments}
          />

          {/* comment fetch-loading */}
          {loading && (
            <div className="comment-loading-flag">
              <MessageSpinner />
            </div>
          )}
        </div>

        {!comments || comments.length === 0 ? (
          <>Write a Comment</>
        ) : (
          comments.map((comment, index) => {
            const userData = comment.user;

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
                  <span id="comment-date">{comment.createdAt}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={buttonRef}></div>
      </div>
    </>
  );

  function scrollHanlder() {
    useEffect(() => {
      if (!comments && loading) return;

      const prevLength = prevCommentLenght.current;
      const currLenght = comments?.length;

      smopthScroll();
      instantScroll();

      function smopthScroll() {
        if (currLenght === prevLength + 1) {
          buttonRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }

      function instantScroll() {
        if (comments && comments.length <= 10) {
          buttonRef.current.scrollIntoView({
            behavior: "instant",
            block: "end",
          });
        }
      }

      prevCommentLenght.current = currLenght;
    }, [comments, loading]);
  }
};

export default CommentList;
