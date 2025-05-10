import "./ViewPostModal.css";
import { useEffect, useMemo, useRef } from "react";
import { useUsersById } from "../../../hooks/useUsers";
import { FetchedUserType } from "../../../types/user";
import { usePostById } from "../../../hooks/usePost";
import Spinner from "../../Spinner/Spinner";

interface comment {
  user: string;
  content: string;
  createdAt: string;
}

interface CommentListProp {
  postId: string;

  viewUserProfile: (user: FetchedUserType) => void;
}

const CommentList = ({ postId, viewUserProfile }: CommentListProp) => {
  const { comments } = usePostById(postId);
  const userIds = useMemo(
    () => (comments ? comments.map((comment) => comment.user) : []),
    [postId, comments]
  );

  const usersData = useUsersById(userIds);
  const buttonRef = useRef<any>(null);

  useEffect(() => {
    buttonRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log("cooment update");
  }, [comments]);

  return (
    <>
      <div className="comment-list-container">
        {!comments || comments.length === 0 ? (
          <>Write a Comment</>
        ) : (
          comments.map((comment, index) => {
            const userData = usersData[comment.user];

            return (
              <div
                className="comment-cont"
                key={index}
                onClick={() => viewUserProfile(userData)}
              >
                <img
                  src={`http://localhost:4000/uploads/profile/${
                    userData._id || ""
                  }/${userData.profilePicture || ""}`}
                  alt=""
                />
                <div className="comment-content">
                  <div className="info-content">
                    <h5>{userData.fullName || ""}</h5>
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
        <div ref={buttonRef} className="button"></div>
      </div>
    </>
  );
};

export default CommentList;
