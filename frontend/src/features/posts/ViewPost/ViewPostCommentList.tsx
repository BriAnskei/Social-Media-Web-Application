import React, { useEffect, useRef, useState } from "react";
import "./Viewpost.css";
import { FetchPostType } from "../../../types/PostType";
import { FetchedUserType } from "../../../types/user";
import { userProfile } from "../../../utils/ImageUrlHelper";
import { AppDispatch } from "../../../store/store";
import ViewPostCommentFetcher from "./ViewPostCommentFetcher";
import { useComment } from "../../../hooks/useComment";
import { fetchComments } from "../../comment/commentSlice";

interface CommentListProp {
  postData: FetchPostType;
  viewUserProfile: (user: FetchedUserType) => void;
  dispatch: AppDispatch;
}

const ViewPostCommentList = ({
  postData,
  viewUserProfile,
  dispatch,
}: CommentListProp) => {
  const { comments, hasMore, loading, err } = useComment(postData._id);

  const scrollRef = useRef<any>(null);
  const lastScrollRef = useRef<number>(0);

  useEffect(() => {
    const fetchInitialComments = async (): Promise<void> => {
      try {
        if (!postData._id) return;

        await dispatch(fetchComments({ postId: postData._id }));
      } catch (error) {
        console.error(error, err);
      }
    };

    fetchInitialComments();
  }, [postData._id]);

  return (
    <div>
      <div
        className="comment-list-container comment-list-viewpost"
        ref={scrollRef}
      >
        <ViewPostCommentFetcher
          loading={loading}
          hasMore={hasMore}
          comments={comments}
          postId={postData._id}
          dispatch={dispatch}
          scrollRef={scrollRef}
          lastScrollRef={lastScrollRef}
        />
        {!comments || comments.length == 0 ? (
          <>Write a comment</>
        ) : (
          comments.map((comment, index) => {
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
          })
        )}
      </div>
    </div>
  );
};

export default ViewPostCommentList;
