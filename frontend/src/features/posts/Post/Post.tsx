import "./Post.css";
import { useDispatch } from "react-redux";
import { toggle } from "../postSlice";
import { useState } from "react";
import { FetchPostType } from "../../../types/PostType";

interface Post {
  post: FetchPostType;
}

const Post = ({ post }: Post) => {
  const [showComment, setShowComment] = useState(false);

  const dispatch = useDispatch();

  const toggleComments = () => {
    setShowComment(!showComment);
  };

  return (
    <>
      <div className="post-container">
        <div className="post-info">
          <div className="profile-name">
            <img
              src={`http://localhost:4000/uploads/profile/${post.user}/`}
              alt=""
            />
            <div className="name-date">
              <h3>{post.user}</h3>
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="post-info-act">
            <button id="follow-button">+ Follow</button>
            <span className="material-symbols-outlined more-icon">
              more_horiz
            </span>
          </div>
        </div>
        <div className="post-content">{post.content}</div>
        <div className="image-post">
          <img
            src={`http://localhost:4000/images/posts/${post.user}/${post.image}`}
            alt=""
          />
        </div>
        <div className="post-counter">
          <span>1 Likes</span>
          {post.comments.length > 0 && (
            <span>{`${post.comments.length} Comment${
              post.comments.length > 1 ? "s" : ""
            }`}</span>
          )}
        </div>
        <div className="post-action-cont">
          <div className="like-cont">
            <span
              className="material-symbols-outlined"
              onClick={() => dispatch(toggle())}
            >
              thumb_up
            </span>
            <span>Like</span>
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
