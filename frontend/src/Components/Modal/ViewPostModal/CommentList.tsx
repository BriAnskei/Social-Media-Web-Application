import "./ViewPostModal.css";
import { useEffect, useRef, useState } from "react";
import { FetchedUserType } from "../../../types/user";

import { AppDispatch } from "../../../store/store";
import { userProfile } from "../../../utils/ImageUrlHelper";

import { useComment } from "../../../hooks/useComment";
import { fetchComments } from "../../../features/comment/commentSlice";
import CommentsFetcher from "./CommentsFetcher";

interface CommentListProp {
  postId: string;
  viewUserProfile: (user: FetchedUserType) => void;
  dispatch: AppDispatch;
  modalOnShow: boolean;
}

const CommentList = ({
  postId,
  viewUserProfile,
  dispatch,
  modalOnShow,
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
        if (modalOnShow) {
          await dispatch(fetchComments({ postId }));
        }
      } catch (error) {
        console.log(err, error);
      } finally {
      }
    };

    fetchInitialComments();
  }, [postId, modalOnShow]);

  useEffect(() => {
    if (!comments && loading) return;

    const prevLength = prevCommentLenght.current;
    const currLenght = comments?.length;

    if (currLenght === prevLength + 1 || comments?.length === 10) {
      buttonRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    prevCommentLenght.current = currLenght;
  }, [comments, loading]);

  function onScroll() {
    console.log("scrollHeight: ", scrollRef.current.scrollTop);
  }

  return (
    <>
      <div
        className="comment-list-container"
        ref={scrollRef}
        onScroll={onScroll}
      >
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
          {loading && <div>Laoding</div>}
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
};

export default CommentList;
