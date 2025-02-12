import "./Post.css";
import { useDispatch, useSelector } from "react-redux";
import { toggleLike } from "../postSlice";
import { useEffect, useState } from "react";
import { FetchPostType } from "../../../types/PostType";
import { FetchedUserType } from "../../../types/user";
import { AppDispatch, RootState } from "../../../store/store";

interface Post {
  post: FetchPostType;
  user: FetchedUserType;
}

const Post = ({ post, user }: Post) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(
    (state: RootState) => state.user.currentUserId
  );

  const [showComment, setShowComment] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    console.log(currentUser);

    // if current user is included in the like(current user liked this post)
    const isLiked = post.likes.includes(currentUser!);
    setLiked(isLiked);
  }, [post, currentUser]);

  const toggleComments = () => {
    setShowComment(!showComment);
  };

  const handleLike = async () => {
    setLiked(!liked);

    try {
      await dispatch(toggleLike(post._id));
      console.log("component like");
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
              src={`http://localhost:4000/uploads/profile/${user._id}/${user.profilePicture}`}
              alt=""
            />
            <div className="name-date">
              <h3>{user.fullName}</h3>
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="post-info-act">
            {post.user !== currentUser && (
              <button id="follow-button">+ Follow</button>
            )}
            <span className="material-symbols-outlined more-icon">
              more_horiz
            </span>
          </div>
        </div>
        <div className="post-content">{post.content}</div>
        {post.image && (
          <div className="image-post">
            <img
              src={`http://localhost:4000/images/posts/${post.user}/${post.image}`}
              alt=""
            />
          </div>
        )}
        {/* // Make the word plural if there more than one like/comment */}
        <div className="post-counter">
          {/* // Only Display if there is atleast 1 like/comment */}
          {post.likes.length > 0 && (
            <span>{`${post.likes.length} Like${
              post.likes.length > 1 ? "s" : ""
            }`}</span>
          )}
          {post.comments.length > 0 && (
            <span>{`${post.comments.length} Comment${
              post.comments.length > 1 ? "s" : ""
            }`}</span>
          )}
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
        <div
          className={
            showComment && post.comments.length > 0
              ? "commentlist-cont"
              : "no-display"
          }
        >
          {post.comments.map((comment, index) => (
            <div className="comment-cont" key={index}>
              <img
                src="https://wallpapers.com/images/hd/meme-profile-picture-erj8324r4q9rbnlx.jpg"
                alt=""
              />
              <div className="comment-content">
                <div className="info-content">
                  <h5>Brian Ebhrai</h5>
                  <span>{comment.content}</span>
                </div>
                <span id="comment-date">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Post;
