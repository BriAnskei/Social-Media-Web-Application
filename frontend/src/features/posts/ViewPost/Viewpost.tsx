import "./Viewpost.css";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { addComment, fetchPost, toggleLike } from "../postSlice";
import { usePostById } from "../../../hooks/usePost";
import Spinner from "../../../Components/Spinner/Spinner";
import {
  useCurrentUser,
  useUserById,
  useUsersById,
} from "../../../hooks/useUsers";
import { useSocket } from "../../../hooks/socket/useSocket";
import AutoResizeTextarea from "../../../utils/AutoResizeTextaria";
import { CommentEventPayload } from "../../../types/PostType";
import { useNavigate } from "react-router";

interface Post {
  postId: string;
}

const ViewPost = ({ postId }: Post) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.posts);
  const { currentUser } = useCurrentUser();
  const { emitLike, emitComment } = useSocket();
  const postData = usePostById(postId);
  const postOwnerData = useUserById(postData.user);

  const [isSuccess, setIsSucess] = useState(false); // Fetcher response, loading flag

  const [isLiked, setIsLiked] = useState(false);
  const [commentInput, setCommentInput] = useState("");

  const commentUserIds: string[] = useMemo(
    () =>
      postData.comments ? postData.comments.map((comment) => comment.user) : [],
    [postData.comments]
  );
  const commentUsersData = useUsersById(commentUserIds);

  useEffect(() => {
    const getPostData = async (postId: string) => {
      if (!postId) navigate("/");
      console.log("Get Data function runnning");

      const res = await dispatch(fetchPost(postId)).unwrap();
      setIsSucess(res.success);
    };
    getPostData(postId);
  }, [dispatch, postId]);

  useEffect(() => {
    if (!postData.likes) return;

    if (postData.likes.includes(currentUser._id)) {
      setIsLiked(true);
    }
  }, [postData]);

  const handleLike = async () => {
    try {
      const res = await dispatch(toggleLike(postData._id)).unwrap();
      // emit after succesfully saved itto DB
      const data = {
        postId: postData._id,
        postOwnerId: postOwnerData._id,
        userId: currentUser._id!,
      };
      if (res.success) {
        emitLike(data);
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error(error);
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

  const onKeyEvent = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent from adding new line
      submitComment();
    }
  };

  const onChangeHandler = (e: any) => {
    const inputValue = e.target.value;

    setCommentInput(inputValue);
  };

  return (
    <>
      <div className="view-post-con">
        {loading || !postData || !isSuccess || !postOwnerData ? (
          <Spinner />
        ) : (
          <div className="post-container">
            <div className="post-info">
              <div className="profile-name">
                <img
                  src={`http://localhost:4000/uploads/profile/${postOwnerData._id}/${postOwnerData.profilePicture}`}
                  alt=""
                />
                <div className="name-date">
                  <h3>{postOwnerData.fullName}</h3>
                  <span>{new Date(postData.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="post-info-act">
                <span className="material-symbols-outlined more-icon">
                  more_horiz
                </span>
              </div>
            </div>
            <div className="post-content">{postData.content}</div>
            {postData.image && (
              <div className="image-container">
                <img
                  src={`http://localhost:4000/images/posts/${postData.user}/${postData.image}`}
                  alt=""
                />
              </div>
            )}
            {/* // Make the word plural if there more than one like/comment */}
            <div className="post-counter">
              {/* // Only Display if there is atleast 1 like/comment */}
              <span>
                {postData.likes.length > 0 &&
                  `${postData.likes.length} Like${
                    postData.likes.length > 1 ? "s" : ""
                  }`}
              </span>
              <span>
                {postData.comments.length > 0 &&
                  `${postData.comments.length} Comment${
                    postData.comments.length > 1 ? "s" : ""
                  }`}
              </span>
            </div>
            <div className="post-action-cont view-post-act">
              <div
                className="like-act-con"
                role="button"
                tabIndex={0}
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
                <span className="material-symbols-outlined">comment</span>
                <span>Comment</span>
              </div>
            </div>
            <div className="comment-list-container comment-list-viewpost">
              {!postData.comments || postData.comments.length == 0 ? (
                <>Write a comment</>
              ) : (
                postData.comments.map((comment, index) => {
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
                })
              )}
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
                      <span className="material-symbols-outlined">send</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewPost;
