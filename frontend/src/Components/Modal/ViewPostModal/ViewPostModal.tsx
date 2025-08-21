import React, { useEffect, useState } from "react";
import "./ViewPostModal.css";
import { ModalTypes } from "../../../types/modalTypes";

import { useCurrentUser, useUserById } from "../../../hooks/useUsers";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import {
  increamentComment,
  toggleLike,
} from "../../../features/posts/postSlice";

import AutoResizeTextarea from "../../../utils/AutoResizeTextaria";
import { usePostById } from "../../../hooks/usePost";
import { useSocket } from "../../../hooks/socket/useSocket";
import { followToggled } from "../../../features/users/userSlice";
import { FetchedUserType, FollowPayload } from "../../../types/user";
import Spinner from "../../Spinner/Spinner";
import { viewProfile } from "../globalSlice";
import { useNavigate } from "react-router";
import CommentList from "./CommentList";
import {
  addComment,
  resetCommets,
} from "../../../features/comment/commentSlice";

import { userProfile } from "../../../utils/ImageUrlHelper";

interface PostModal extends Omit<ModalTypes, "onClose"> {
  onClose: () => void;
  postId: string;
}

const ViewPostModal: React.FC<PostModal> = ({ showModal, onClose, postId }) => {
  const postData = usePostById(postId);
  const postOwner = postData.user as FetchedUserType;
  const postOwnerData = useUserById(postOwner?._id);

  // early return to prevent undifined properties during app renders. unless the modal is viewed
  if (!postData || !postOwnerData) return;

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { emitFollow, emitComment } = useSocket();
  const { currentUser } = useCurrentUser(); // current user data

  const [isOwnerFollowed, setIsOwnerFollowed] = useState(false);
  const [followToggleClass, setFollowToggleClass] = useState("follow-button");

  const [likeOnProgress, setLikeOnProgress] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    if (!postData?.likes || !currentUser._id || !postOwnerData) return;

    if (postData && currentUser._id) {
      const isPostLiked = postData?.likes.includes(currentUser._id);
      setIsLiked(isPostLiked);
    }
  }, [postId, currentUser]);

  useEffect(() => {
    if (!postOwnerData.followers) return;

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
    dispatch(resetCommets(postId));
    onClose();
  };

  const handleFollow = async () => {
    try {
      setFollowToggleClass("followed");

      const data: FollowPayload = {
        userId: postOwnerData._id,
        followerId: currentUser._id,
      };
      const res = await dispatch(followToggled(data)).unwrap();

      if (!res.success) {
        console.error(res.message || "failed to follow user");
        return;
      }

      emitFollow({
        ...data,
        followingName: currentUser.fullName.match(/^\w+/)?.[0]!,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike = async () => {
    try {
      if (likeOnProgress) return;
      setLikeOnProgress(true);
      setIsLiked(!isLiked);
      await dispatch(
        toggleLike({
          postId,
          userName: currentUser.fullName.match(/^\w+/)?.[0]!,
        })
      );

      setTimeout(() => {
        setLikeOnProgress(false);
      }, 200);
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

  const submitComment = () => {
    // Check if comment is empty
    if (!commentInput.trim()) return;

    const emitionPayload = {
      user: currentUser,
      post: {
        postId: postData._id,
        postOwnerId: postOwnerData._id,
        postOwnerName: postOwnerData.fullName,
      },
      content: commentInput,
      createdAt: new Date(),
    };

    const commentPayload = {
      postId: postId,
      user: currentUser,
      content: commentInput,
      createdAt: new Date().toISOString(),
    };

    dispatch(addComment(commentPayload));
    dispatch(increamentComment(postId));

    emitComment(emitionPayload);
    setCommentInput("");
  };

  const viewUserProfile = (user: FetchedUserType) => {
    dispatch(viewProfile(user));
    onClose();

    const route = user._id !== currentUser._id ? "/view/profile" : "/profile";
    navigate(route);
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
                          src={userProfile(
                            postOwnerData.profilePicture,
                            postOwnerData._id
                          )}
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
                          postOwnerData._id !== currentUser._id && (
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
                    {postData.content && (
                      <div className="post-modal-text-content">
                        {postData.content}
                      </div>
                    )}
                    {postData.image && (
                      <div className="post-modal-image-container">
                        <img
                          src={`http://localhost:4000/images/posts/${postOwnerData._id}/${postData.image}`}
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

                      {postData.totalComments > 0 && (
                        <span>
                          {`${postData.totalComments} Comment${
                            postData.totalComments > 1 ? "s" : ""
                          }`}
                        </span>
                      )}
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

                    {/* comment list */}
                    <CommentList
                      modalOnShow={showModal}
                      totalComments={postData.totalComments}
                      dispatch={dispatch}
                      postId={postId}
                      viewUserProfile={viewUserProfile}
                    />

                    <div className="comment-con-inputs">
                      <div className="post-modal-profile">
                        <img
                          src={userProfile(
                            currentUser.profilePicture,
                            currentUser._id
                          )}
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
