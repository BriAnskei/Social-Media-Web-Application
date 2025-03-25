import "./Post.css";
import { useDispatch, useSelector } from "react-redux";
import { addComment, toggleLike } from "../postSlice";
import { useEffect, useState } from "react";
import { CommentEventPayload, FetchPostType } from "../../../types/PostType";
import { FetchedUserType, FollowPayload } from "../../../types/user";
import { AppDispatch, RootState } from "../../../store/store";
import { useSocket } from "../../../hooks/socket/useSocket";
import { useModal } from "../../../hooks/useModal";
import { useCurrentUser, useUserById } from "../../../hooks/useUsers";
import { followToggled } from "../../users/userSlice";

interface Post {
  post: FetchPostType;
  ownerId: string;
}

const Post = ({ post, ownerId }: Post) => {
  const { currentUser } = useCurrentUser();
  const { postModal } = useModal();
  const { emitLike } = useSocket();

  const postOwnerData = useUserById(ownerId);

  const { openPostModal } = postModal;
  const dispatch = useDispatch<AppDispatch>();

  const [liked, setLiked] = useState(false);
  const [isOwnerFollowed, setIsOwnerFollowed] = useState(false);
  const [followToggleClass, setFollowToggleClass] = useState("follow-button");

  useEffect(() => {
    // if current user is included in the like(current user liked this post)
    const isLiked = post.likes.includes(currentUser._id!);
    setLiked(isLiked);
  }, [post, currentUser._id]);

  useEffect(() => {
    if (!postOwnerData || !currentUser) return;

    // check if the current user folows the post owner
    if (postOwnerData.followers.includes(currentUser._id)) {
      setIsOwnerFollowed(true);
    }
  }, [postOwnerData.followers, currentUser]);

  const toggleComments = () => {
    openPostModal(post._id);
  };

  const handleLike = async () => {
    try {
      const res = await dispatch(toggleLike(post._id)).unwrap();
      // emit after succesfully saved itto DB
      if (res) {
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
      if (isOwnerFollowed) return;

      const data: FollowPayload = {
        userId: post.user,
        followerId: currentUser._id,
      };
      const res = await dispatch(followToggled(data)).unwrap();

      if (!res.success) return;

      setFollowToggleClass("followed");

      // Make the button disappear after 3 seconds
      setTimeout(() => {
        setFollowToggleClass(""); // Removes the button
      }, 3000);
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
          <div className="image-container">
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
