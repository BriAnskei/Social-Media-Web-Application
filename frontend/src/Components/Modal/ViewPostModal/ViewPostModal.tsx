import React, { useEffect, useState } from "react";
import "./ViewPostModal.css";
import { ModalTypes } from "../../../types/modalTypes";
import { CommentEventPayload } from "../../../types/PostType";
import { useCurrentUser, useUserById } from "../../../hooks/useUsers";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { addComment, toggleLike } from "../../../features/posts/postSlice";

import AutoResizeTextarea from "../../../utils/AutoResizeTextaria";
import { usePostById } from "../../../hooks/usePost";
import { useSocket } from "../../../hooks/socket/useSocket";
import { followToggled } from "../../../features/users/userSlice";
import { FetchedUserType, FollowPayload } from "../../../types/user";
import Spinner from "../../Spinner/Spinner";
import { viewProfile } from "../globalSlice";
import { useNavigate } from "react-router";
import CommentList from "./CommentList";

interface PostModal extends Omit<ModalTypes, "onClose"> {
  onClose: () => void;
  postId: string;
}

const ViewPostModal: React.FC<PostModal> = ({ showModal, onClose, postId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { emitComment, emitLike, emitFollow } = useSocket();
  const { currentUser } = useCurrentUser(); // ccurrent user data

  const postData = usePostById(postId);
  const postOwnerData = useUserById(postData.user);

  const [isOwnerFollowed, setIsOwnerFollowed] = useState(false);
  const [followToggleClass, setFollowToggleClass] = useState("follow-button");

  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    if (!postData.likes || !currentUser._id || !postOwnerData) return;

    if (postData && currentUser._id) {
      const isPostLiked = postData.likes.includes(currentUser._id);
      setIsLiked(isPostLiked);
    }
  }, [postId, currentUser]);

  useEffect(() => {
    if (!postOwnerData.followers || !currentUser) return;
    // check if thw owner is followed
    if (postOwnerData.followers.includes(currentUser._id)) {
      setButtonDisplay();
    }
  }, [postOwnerData, currentUser, postId]);

  const setButtonDisplay = () => {
    // if classID is setted to followed, the follow is being toggled in modal, otherwise in posts
    if (followToggleClass !== "followed") {
      setIsOwnerFollowed(true);
    } else {
      setTimeout(() => {
        setFollowToggleClass(""); // Removes the button
        setIsOwnerFollowed(true);
      }, 3000);
    }
  };

  const ToggleClose = () => {
    setCommentInput("");
    onClose();
  };

  const handleFollow = async () => {
    try {
      setFollowToggleClass("followed");

      const data: FollowPayload = {
        userId: postData.user,
        followerId: currentUser._id,
      };
      const res = await dispatch(followToggled(data)).unwrap();

      if (!res.success) {
        console.error(res.message || "failed to follow user");
        return;
      }

      emitFollow(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike = async () => {
    try {
      const res = await dispatch(toggleLike(postId)).unwrap();
      // emit after succesfully saved itto DB
      if (res) {
        const data = {
          postId: postId,
          postOwnerId: postData.user,
          userId: currentUser._id!,
        };

        emitLike(data);
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onChangeHandler = (e: any) => {
    const inputValue = e.target.value;

    setCommentInput(inputValue);
  };

  const onKeyEvent = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent from adding new line
      submitComment();
    }
  };

  const submitComment = async () => {
    // Check if comment is empty
    if (!commentInput.trim()) return;

    try {
      let data: CommentEventPayload = {
        postId: postData._id,
        data: {
          user: currentUser._id,
          content: commentInput,
        },
      };

      const res = await dispatch(addComment(data)).unwrap();

      if (res.success) {
        const eventCommentData: CommentEventPayload = {
          postId: postData._id,
          postOwnerId: postOwnerData!._id,
          data: res.commentData!,
        };

        emitComment(eventCommentData);
      }
      setCommentInput("");
    } catch (error) {
      console.log(error);
    }
  };

  const viewUserProfile = (user: FetchedUserType) => {
    dispatch(viewProfile(user));
    onClose();

    const nav = user._id !== currentUser._id ? "/view/profile" : "/profile";
    navigate(nav);
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
              {!postOwnerData.fullName ? (
                <Spinner />
              ) : (
                <>
                  <h5>{postOwnerData.fullName.replace(/ .*/, "")}' s post</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={ToggleClose}
                  />
                </>
              )}
            </div>
            <div className="modal-body  view-post-modal-body">
              {!postData && !postOwnerData ? (
                <Spinner />
              ) : (
                <>
                  <div className="view-post-modal-data">
                    <div className="post-modal-content-data">
                      <div className="post-modal-profile-data">
                        <img
                          src={`http://localhost:4000/uploads/profile/${postOwnerData?._id}/${postOwnerData?.profilePicture}`}
                          alt=""
                        />
                        <div className="post-modal-name-date">
                          <h3>{postOwnerData?.fullName}</h3>
                          <span>
                            {new Date(postData.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="post-modal-act">
                        {followToggleClass !== "" &&
                          !isOwnerFollowed &&
                          postData.user !== currentUser._id && (
                            <button
                              id={followToggleClass}
                              onClick={handleFollow}
                            >
                              {followToggleClass === "followed"
                                ? "✔ Followed"
                                : "+ Follow"}
                            </button>
                          )}
                        <span
                          className="material-symbols-outlined more-icon"
                          data-to
                        >
                          more_horiz
                        </span>
                      </div>
                    </div>
                    <div className="post-modal-text-content">
                      {postData?.content}
                    </div>
                    {postData.image && (
                      <div className="post-modal-image-container">
                        <img
                          src={`http://localhost:4000/images/posts/${postData.user}/${postData.image}`}
                          alt=""
                        />
                      </div>
                    )}
                    <div className="post-modal-counter">
                      {/* // Only Display if there is atleast 1 like/comment */}
                      <span>
                        {postData.likes && postData.likes.length > 0 && (
                          <>{`${postData.likes.length} Like${
                            postData.likes.length > 1 ? "s" : ""
                          }`}</>
                        )}
                      </span>
                      <span>
                        {postData.comments && postData.comments.length > 0 && (
                          <>{`${postData.comments.length} Comment${
                            postData.comments.length > 1 ? "s" : ""
                          }`}</>
                        )}
                      </span>
                    </div>
                    <div className="post-modal-action-cont">
                      <div
                        className="like-act-con"
                        role="button" // act as button
                        tabIndex={0} // fucosable
                        aria-pressed={isLiked}
                        onClick={handleLike}
                      >
                        <span
                          className={`material-symbols-outlined   ${
                            isLiked ? "filled-icon" : ""
                          }`}
                        >
                          thumb_up
                        </span>
                        <span id={`${isLiked ? "like-text" : ""}`}>{`Like${
                          isLiked ? "d" : ""
                        }`}</span>
                      </div>
                      <div className="comment-logo">
                        <span className="material-symbols-outlined">
                          comment
                        </span>
                        <span>Comment</span>
                      </div>
                    </div>
                    <>
                      {/* comment list */}
                      <CommentList
                        postId={postId}
                        viewUserProfile={viewUserProfile}
                      />
                    </>
                    <div className="comment-con-inputs">
                      <div className="post-modal-profile">
                        <img
                          src={`http://localhost:4000/uploads/profile/${currentUser._id}/${currentUser.profilePicture}`}
                          alt=""
                        />
                      </div>
                      <div className="modal-input-con">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            submitComment();
                          }}
                        >
                          <AutoResizeTextarea
                            onChange={onChangeHandler}
                            value={commentInput}
                            onKeyEvent={onKeyEvent}
                          />

                          <button type="submit">
                            <span className="material-symbols-outlined">
                              send
                            </span>
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewPostModal;
