import "./Post.css";
import { useDispatch } from "react-redux";
import { toggleLike } from "../postSlice";
import { useEffect, useRef, useState } from "react";
import { FetchPostType } from "../../../types/PostType";
import { FollowPayload } from "../../../types/user";
import { AppDispatch } from "../../../store/store";
import { useSocket } from "../../../hooks/socket/useSocket";

import { useCurrentUser, useUserById } from "../../../hooks/useUsers";
import { followToggled } from "../../users/userSlice";
import {
  openPostModal,
  viewProfile,
} from "../../../Components/Modal/globalSlice";
import { useNavigate } from "react-router";
import { usePopoverContext } from "../../../hooks/usePopover";

interface Post {
  post: FetchPostType;
  ownerId: string;
}

const Post = ({ post, ownerId }: Post) => {
  const { currentUser } = useCurrentUser();
  const { popover } = usePopoverContext();
  const { emitLike, emitFollow } = useSocket();
  const navigate = useNavigate();

  const postOwnerData = useUserById(ownerId);

  const dispatch = useDispatch<AppDispatch>();

  // popover menu
  const target = useRef(null);

  // like state
  const [liked, setLiked] = useState(false);
  const [likeProgress, setLikeProgress] = useState(false);

  // follow satte
  const [isOwnerFollowed, setIsOwnerFollowed] = useState(false);
  const [followToggleClass, setFollowToggleClass] = useState("follow-button");
  const [toggleFollow, setToggleFollow] = useState(false);
  const [followingProgress, setFollowingProgress] = useState(false);

  // Validate if current post is liked
  useEffect(() => {
    const isLiked = post.likes.includes(currentUser._id!);
    setLiked(isLiked);
  }, [post, currentUser._id]);

  useEffect(() => {
    if (post.user !== currentUser._id) {
      validateFollow();
    }
  }, [postOwnerData.followers, currentUser.following]);

  const viewPostOwnerProf = () => {
    if (!(Object.keys(postOwnerData).length > 0))
      throw new Error("Failed to view postowner, object is empty");

    dispatch(viewProfile(postOwnerData));

    const nav =
      postOwnerData._id !== currentUser._id ? "/view/profile" : "/profile";

    navigate(nav);
  };

  const validateFollow = () => {
    if (!postOwnerData.followers || !currentUser._id) return;

    // check if the current user follows the post owner, this will prevent to show the follow button
    if (postOwnerData.followers.includes(currentUser._id)) {
      // check if this component triggered the follow. if so, wait for 3 sec before removing the follow button
      if (!toggleFollow) {
        setFollowToggleClass("");
        setIsOwnerFollowed(true); // remove autoamtically
      } else {
        setTimeout(() => {
          setIsOwnerFollowed(true);
          setFollowToggleClass("");
        }, 3000);
      }
    } else {
      setIsOwnerFollowed(false);
      setFollowToggleClass("follow-button");
    }
  };

  const handleFollow = async () => {
    try {
      if (followingProgress) return;
      setFollowingProgress(true);

      if (toggleFollow || postOwnerData.followers.includes(currentUser._id)) {
        return;
      }

      setFollowToggleClass("followed");
      setToggleFollow(true);

      const data: FollowPayload = {
        userId: post.user,
        followerId: currentUser._id,
      };

      const res = await dispatch(followToggled(data)).unwrap();

      if (!res.success) {
        setFollowToggleClass("");
        setToggleFollow(false);
        console.error(res.message || "Error handling follow");
        return;
      }

      const emitPayload = {
        userId: post.user,
        followerId: currentUser._id,
        followingName: currentUser.fullName,
      };

      emitFollow(emitPayload);
    } catch (error) {
      console.error(error);
    } finally {
      setFollowingProgress(false);
    }
  };

  const toggleComments = () => {
    dispatch(openPostModal(post._id));
  };

  const handleLike = async () => {
    try {
      if (likeProgress) return;
      setLikeProgress(true);
      const res = await dispatch(toggleLike(post._id)).unwrap();

      if (!res.success) {
        console.error("Failed to like the post: ", res.message);
        return;
      }

      // emit after succesfully saved itto DB
      const data = {
        postId: post._id,
        postOwnerId: postOwnerData._id,
        userId: currentUser._id!,
      };
      setLiked(!liked);
      emitLike(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLikeProgress(false);
    }
  };

  const isFollowedShow =
    !isOwnerFollowed &&
    followToggleClass !== "" &&
    post.user !== currentUser._id;

  return (
    <>
      <div className="post-container">
        <div className="post-info">
          <div className="profile-name">
            <img
              src={`http://localhost:4000/uploads/profile/${postOwnerData._id}/${postOwnerData.profilePicture}`}
              style={{ cursor: "pointer" }}
              onClick={viewPostOwnerProf}
            />
            <div className="name-date">
              <h3 style={{ cursor: "pointer" }} onClick={viewPostOwnerProf}>
                {postOwnerData.fullName}
              </h3>
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="post-info-act">
            {isFollowedShow && (
              <button id={followToggleClass} onClick={handleFollow}>
                {followToggleClass === "followed" ? "✔ Followed" : "+ Follow"}
              </button>
            )}
            <span
              className={`material-symbols-outlined ${
                post.user === currentUser._id ? "more-icon" : ""
              }`}
              ref={target}
              onClick={() => {
                post.user !== currentUser._id
                  ? undefined
                  : popover.popOverToggle(post._id, target);
              }}
            >
              more_horiz
            </span>
          </div>
        </div>
        <div className="post-content">{post.content}</div>
        {post.image && (
          <div className="image-container" onClick={toggleComments}>
            <img
              src={`http://localhost:4000/images/posts/${post.user}/${post.image}`}
              alt=""
            />
          </div>
        )}
        {/* // Make the word plural if there more than one like/comment */}
        <div className="post-counter">
          {/* // Only Display if there is atleast 1 like/comment */}
          <span>
            {post.likes.length > 0 &&
              `${post.likes.length} Like${post.likes.length > 1 ? "s" : ""}`}
          </span>
          <span>
            {post.comments.length > 0 &&
              `${post.comments.length} Comment${
                post.comments.length > 1 ? "s" : ""
              }`}
          </span>
        </div>
        <div className="post-action-cont">
          <div
            className="like-cont"
            role="button"
            tabIndex={0}
            aria-pressed={liked}
            onClick={handleLike}
          >
            <span
              className={`material-symbols-outlined   ${
                liked ? "filled-icon" : ""
              }`}
            >
              thumb_up
            </span>
            <span id={`${liked ? "like-text" : ""}`}>{`Like${
              liked ? "d" : ""
            }`}</span>
          </div>

          <div className="comment-act-cont" onClick={toggleComments}>
            <span className="material-symbols-outlined">comment</span>
            <span>Comment</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
