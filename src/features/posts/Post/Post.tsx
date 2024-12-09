import "./Post.css";
import { PostProp } from "../PostList/PostList";
import { useDispatch } from "react-redux";
import { toggle } from "../postSlice";
interface PostProps {
  post: PostProp;
}

const Post = ({ post }: PostProps) => {
  const dispatch = useDispatch();

  return (
    <>
      <div className="post-container">
        <div className="post-info">
          <div className="profile-name">
            <img
              src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg"
              alt=""
            />
            <h3>{post.user}</h3>
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
          <img src={post.image} alt="" />
        </div>
        <div className="post-action-cont">
          <span
            className="material-symbols-outlined"
            onClick={() => dispatch(toggle())}
          >
            thumb_up
          </span>
          <span className="material-symbols-outlined">comment</span>
        </div>
      </div>
    </>
  );
};

export default Post;
