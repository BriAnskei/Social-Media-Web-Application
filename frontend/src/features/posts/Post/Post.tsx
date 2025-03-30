import "./Post.css";
import { useDispatch } from "react-redux";
import { toggleLike } from "../postSlice";
import { useEffect, useState } from "react";
import { FetchPostType } from "../../../types/PostType";
import { FollowPayload } from "../../../types/user";
import { AppDispatch } from "../../../store/store";
import { useSocket } from "../../../hooks/socket/useSocket";
import { useModal } from "../../../hooks/useModal";
import { useCurrentUser, useUserById } from "../../../hooks/useUsers";
import { followToggled, updateFollow } from "../../users/userSlice";

interface Post {
  post: FetchPostType;
  ownerId: string;
}

const Post = ({ post, ownerId }: Post) => {
  const { currentUser } = useCurrentUser();
  const { postModal } = useModal();
  const { emitLike, emitFollow } = useSocket();

  const postOwnerData = useUserById(ownerId);

  const { openPostModal } = postModal;
  const dispatch = useDispatch<AppDispatch>();

  const [liked, setLiked] = useState(false);
  const [isOwnerFollowed, setIsOwnerFollowed] = useState(false);
  const [followToggleClass, setFollowToggleClass] = useState("follow-button");
  const [toggleFollow, setToggleFollow] = useState(false);

  useEffect(() => {
    // if current user is included in the like(current user liked this post)
    const isLiked = post.likes.includes(currentUser._id!);
    setLiked(isLiked);
  }, [post, currentUser._id]);

  useEffect(() => {
    if (post.user !== currentUser._id) {
      validateFollow();
    }
  }, [postOwnerData.followers, currentUser.following]);

  const validateFollow = () => {
    if (!postOwnerData.followers || !currentUser._id) return;

    // check if the current user follows the post owner, this will prevent to show the follow button
    if (postOwnerData.followers.includes(currentUser._id)) {
      console.log("currentuser followed the postOwner");

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
    }
  };

  const toggleComments = () => {
    openPostModal(post._id);
  };

  const handleLike = async () => {
    try {
      const res = await dispatch(toggleLike(post._id)).unwrap();
      // emit after succesfully saved itto DB
      if (res && res) {
        const data = {
          postId: post._id,
          postOwnerId: postOwnerData._id,
          userId: currentUser._id!,
        };

        emitLike(data);
        setLiked(!liked);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFollow = async () => {
    try {
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
        console.error(res.message || "Error handling follow");
        return;
      }
      dispatch(updateFollow(data));

      const emitPayload = {
        userId: post.user,
        followerId: currentUser._id,
        followingName: currentUser.fullName,
      };

      emitFollow(emitPayload);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="post-container">
        <div className="post-info">
          <div className="profile-name">
            <img
              src={`http://localhost:4000/uploads/profile/${postOwnerData._id}/${postOwnerData.profilePicture}`}
              alt=""
            />
            <div className="name-date">
              <h3>{postOwnerData.fullName}</h3>
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="post-info-act">
            {!isOwnerFollowed &&
              post.user !== currentUser._id &&
              followToggleClass !== "" && (
                <button id={followToggleClass} onClick={handleFollow}>
                  {followToggleClass === "followed" ? "✔ Followed" : "+ Follow"}
                </button>
              )}
            <span className="material-symbols-outlined more-icon">
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
