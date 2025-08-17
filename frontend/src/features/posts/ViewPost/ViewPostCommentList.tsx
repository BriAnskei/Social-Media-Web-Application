import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Viewpost.css";
import { FetchPostType } from "../../../types/PostType";
import { FetchedUserType } from "../../../types/user";
import { userProfile } from "../../../utils/ImageUrlHelper";
import { AppDispatch } from "../../../store/store";
import ViewPostCommentFetcher from "./ViewPostCommentFetcher";
import { useComment } from "../../../hooks/useComment";
import { fetchComments } from "../../comment/commentSlice";
import { MessageSpinner } from "../../../Components/Spinner/Spinner";

interface CommentListProp {
  postId: string;
  viewUserProfile: (user: FetchedUserType) => void;
  dispatch: AppDispatch;
}

const ViewPostCommentList = React.memo(
  ({ postId, viewUserProfile, dispatch }: CommentListProp) => {
    const { comments, hasMore, loading, err } = useComment(postId);

    const scrollRef = useRef<any>(null);
    const lastScrollRef = useRef<number>(0);

    // scroll refs
    const buttomRef = useRef<any>(null);
    const lastIndexRef = useRef<number>(0);

    useEffect(() => {
      if (!comments || loading) return;

      function intantScroll() {
        if (comments && comments.length === 10) {
          buttomRef.current.scrollIntoView({
            behavior: "instant",
            block: "end",
          });
        }
      }

      function smoothScroll() {
        const prevLength = lastIndexRef.current;
        const currLength = comments.length;

        if (currLength === prevLength + 1) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }

      smoothScroll();
      intantScroll();
      lastIndexRef.current = comments.length;
    }, [comments, loading]);

    useEffect(() => {
      const fetchInitialComments = async (): Promise<void> => {
        try {
          if (!postId) return;

          await dispatch(fetchComments({ postId: postId }));
        } catch (error) {
          console.error(error, err);
        }
      };

      fetchInitialComments();
    }, [postId]);

    return (
      <div className=" comment-list-viewpost" ref={scrollRef}>
        <div>
          <ViewPostCommentFetcher
            loading={loading}
            hasMore={hasMore}
            comments={comments}
            postId={postId}
            dispatch={dispatch}
            scrollRef={scrollRef}
            lastScrollRef={lastScrollRef}
          />

          {/* comment fetch-loading */}
          {loading && (
            <div className="comment-loading-flag">
              <MessageSpinner />
            </div>
          )}
        </div>
        {!comments || comments.length == 0 ? (
          <>Write a comment</>
        ) : (
          <>
            {comments.map((comment, index) => {
              const commentUserData = comment.user as FetchedUserType;

              return (
                <div
                  className="comment-cont"
                  key={index}
                  onClick={() => viewUserProfile(commentUserData)}
                >
                  <img
                    src={userProfile(
                      commentUserData.profilePicture!,
                      commentUserData._id
                    )}
                    alt=""
                  />
                  <div className="comment-content">
                    <div className="info-content">
                      <h5>{commentUserData.fullName}</h5>
                      <span>{comment.content}</span>
                    </div>
                    <span id="comment-date">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={buttomRef} />
      </div>
    );
  }
);

export default ViewPostCommentList;
