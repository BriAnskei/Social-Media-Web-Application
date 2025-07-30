import React, { useEffect, useRef, useState } from "react";
import "./Viewpost.css";
import { FetchPostType } from "../../../types/PostType";
import { FetchedUserType } from "../../../types/user";
import { userProfile } from "../../../utils/ImageUrlHelper";
import { AppDispatch } from "../../../store/store";
import ViewPostCommentFetcher from "./ViewPostCommentFetcher";

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
  const scrollRef = useRef<any>(null);
  const lastScrollRef = useRef<number>(0);

  const [cursor, setCursor] = useState<string>("");
  const [hasMoreComments, setHasMoreComment] = useState(false);

  useEffect(() => {
    const lastCommentCursor = postData.comments[0];

    console.log("expected laast comment cursor: ", lastCommentCursor.content);

    setCursor(lastCommentCursor.createdAt);
    setHasMoreComment(postData.hasMoreComments);
  }, [postData._id]);

  return (
    <div>
      <div
        className="comment-list-container comment-list-viewpost"
        ref={scrollRef}
      >
        <ViewPostCommentFetcher
          hasMore={hasMoreComments}
          cursor={cursor}
          setHasMore={setHasMoreComment}
          postId={postData._id}
          setCursor={setCursor}
          dispatch={dispatch}
          scrollRef={scrollRef}
          lastScrollRef={lastScrollRef}
        />
        {!postData.comments || postData.comments.length == 0 ? (
          <>Write a comment</>
        ) : (
          postData.comments.map((comment, index) => {
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
