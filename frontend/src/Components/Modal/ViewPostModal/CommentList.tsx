import "./ViewPostModal.css";
import { useEffect, useMemo, useRef } from "react";
import { useUsersById } from "../../../hooks/useUsers";
import { FetchedUserType } from "../../../types/user";
import { usePostById } from "../../../hooks/usePost";
import CommentsFetcher from "./Commentsfetcher";

interface CommentListProp {
  postId: string;

  viewUserProfile: (user: FetchedUserType) => void;
}

const CommentList = ({ postId, viewUserProfile }: CommentListProp) => {
  const { comments } = usePostById(postId);
  // const userIds = useMemo(
  //   () => (comments ? comments.map((comment) => comment.user) : []),
  //   [postId, comments]
  // );

  // const usersData = useUsersById(userIds);
  const buttonRef = useRef<any>(null);

  useEffect(() => {
    buttonRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  return (
    <>
      <div className="comment-list-container">
        <CommentsFetcher hasMore={true} postId={postId} />
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
                  src={`http://localhost:4000/uploads/profile/${userData._id}/${userData.profilePicture}`}
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
