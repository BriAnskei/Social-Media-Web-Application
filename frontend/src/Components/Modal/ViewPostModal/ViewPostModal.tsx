import React, { useMemo, useState } from "react";
import "./ViewPostModal.css";
import { ModalTypes } from "../../../types/modalTypes";
import {
  CommentEventPayload,
  CommentType,
  FetchPostType,
} from "../../../types/PostType";
import {
  useCurrentUser,
  useUserById,
  useUsersById,
} from "../../../hooks/useUsers";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { addComment } from "../../../features/posts/postSlice";
import { useSocket } from "../../../hooks/socket/useSocket";
import AutoResizeTextarea from "../../../utils/AutoResizeTextaria";

interface PostModal extends Omit<ModalTypes, "onClose"> {
  onClose: () => void;
  post: FetchPostType;
}

const ViewPostModal: React.FC<PostModal> = ({ showModal, onClose, post }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { emitComment, isConnected } = useSocket();
  const { currentUser } = useCurrentUser(); // ccurrent user data
  const postOwnerData = useUserById(post.user);

  // get all user id's in the post comment, after that get the users data per comment
  const commentUserIds = useMemo(
    () => post.comments.map((comment) => comment.user),
    [post.comments]
  );
  const commentUsersData = useUsersById(commentUserIds);

  const [commentInput, setCommentInput] = useState("");

  const ToggleClose = () => {
    setCommentInput("");

    onClose();
  };

  const onChangeHandler = (e: any) => {
    const inputValue = e.target.value;

    setCommentInput(inputValue);
  };

  const submitComment = async (e: any) => {
    e.preventDefault();
    try {
      let data: CommentType = {
        postId: post._id,

        data: {
          user: currentUser._id,
          content: commentInput,
        },
      };

      const res = await dispatch(addComment(data)).unwrap();

      console.log("commnet data after commenting: ", res);

      if (res.success) {
        const eventCommentData: CommentEventPayload = {
          postId: post._id,
          postOwnerId: postOwnerData._id,
          data: res.commentData!,
        };

        emitComment(eventCommentData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div
        className={`modal fade ${
          showModal ? "show d-block" : ""
        } view-post-modal`}
        tabIndex={-1}
      >
        <div className="modal-dialog   modal-lg view-post-modal-dialog">
          <div className="modal-content view-post-modal-content">
            <div className="modal-header view-post-modal-header">
              {postOwnerData ? (
                <h5>{postOwnerData.fullName}</h5>
              ) : (
                <h5>Loading....</h5>
              )}
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={ToggleClose}
              />
            </div>
            <div className="modal-body  view-post-modal-body">
              <div className="view-post-modal-data">
                <div className="post-modal-content-data">
                  <div className="post-modal-profile-data">
                    <img
                      src={`http://localhost:4000/uploads/profile/${postOwnerData?._id}/${postOwnerData?.profilePicture}`}
                      alt=""
                    />
                    <div className="post-modal-name-date">
                      <h3>{postOwnerData?.fullName}</h3>
                      <span>{new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="post-modal-act">
                    <button>+ Follow</button>
                    <span
                      className="material-symbols-outlined more-icon"
                      data-to
                    >
                      more_horiz
                    </span>
                  </div>
                </div>
                <div className="post-modal-text-content">{post?.content}</div>
                {post.image && (
                  <div className="post-modal-image-container">
                    <img
                      src={`http://localhost:4000/images/posts/${post.user}/${post.image}`}
                      alt=""
                    />
                  </div>
                )}
                <div className="post-modal-counter">
                  {/* // Only Display if there is atleast 1 like/comment */}
                  <span>
                    {post.likes.length > 0 && (
                      <>{`${post.likes.length} Like${
                        post.likes.length > 1 ? "s" : ""
                      }`}</>
                    )}
                  </span>
                  <span>
                    {" "}
                    {post.comments.length > 0 && (
                      <>{`${post.comments.length} Comment${
                        post.comments.length > 1 ? "s" : ""
                      }`}</>
                    )}
                  </span>
                </div>
                <div className="post-modal-action-cont">
                  <div
                    className="like-act-con"
                    role="button" // act as button
                    tabIndex={0} // fucosable
                    aria-pressed={false}
                    // onClick={}
                  >
                    <span className="material-symbols-outlined">thumb_up</span>
                    <span>Like</span>
                  </div>
                  <div className="comment-logo">
                    <span className="material-symbols-outlined">comment</span>
                    <span>Comment</span>
                  </div>
                </div>
                <div className="comment-list-container">
                  {post.comments.map((comment, index) => {
                    const commentUserData = commentUsersData[comment.user];

                    return (
                      <div className="comment-cont" key={index}>
                        <img
                          src={`http://localhost:4000/uploads/profile/${commentUserData._id}/${commentUserData.profilePicture}`}
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
                </div>
                <div className="comment-con-inputs">
                  <div className="post-modal-profile">
                    <img
                      src={`http://localhost:4000/uploads/profile/${currentUser._id}/${currentUser.profilePicture}`}
                      alt=""
                    />
                  </div>
                  <div className="modal-input-con">
                    <AutoResizeTextarea
                      onChange={onChangeHandler}
                      value={commentInput}
                    />
                    <span
                      className="material-symbols-outlined"
                      onClick={submitComment}
                    >
                      send
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewPostModal;
