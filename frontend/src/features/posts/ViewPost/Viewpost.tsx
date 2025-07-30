import "./Viewpost.css";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { FetchedUserType } from "../../../types/user";
import { viewProfile } from "../../../Components/Modal/globalSlice";
import { usePopoverContext } from "../../../hooks/usePopover";
import { getMessageImageUrl, userProfile } from "../../../utils/ImageUrlHelper";
import ViewPostCommentList from "./ViewPostCommentList";

interface Post {
  postId: string;
}

const ViewPost = ({ postId }: Post) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.posts);
  const { currentUser } = useCurrentUser();

  const { emitLike, emitComment } = useSocket();
  const { popover } = usePopoverContext();

  const postPayload = usePostById(postId);
  const { postData, fetchCommentLoading } = postPayload;

  const postOwnerData = postData.user as FetchedUserType;

  const [isSuccess, setIsSucess] = useState(false); // Fetcher response, loading flag

  const [isLiked, setIsLiked] = useState(false);
  const [commentInput, setCommentInput] = useState("");

  // popover ref
  const target = useRef(null);

  useEffect(() => {
    const getPostData = async (postId: string) => {
      if (!postId || Object.keys(postData).length === 0) {
        navigate("/");
        return;
      }

      const res = await dispatch(fetchPost(postId)).unwrap();
      setIsSucess(res.success);
    };
    getPostData(postId);
  }, [dispatch, postId, postData]);

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
      const data: CommentEventPayload = {
        postId: postData._id,
        data: {
          user: currentUser._id,
          content: commentInput,
          createdAt: new Date().toISOString(),
        },
      };

      await dispatch(addComment(data)).unwrap();

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

  const viewUserProfile = (user: FetchedUserType) => {
    dispatch(viewProfile(user));

    const nav = user._id !== currentUser._id ? "/view/profile" : "/profile";
    navigate(nav);
  };

  const isLoading =
    loading ||
    Object.keys(postData).length === 0 ||
    !isSuccess ||
    !postOwnerData;

  return (
    <>
      <div className="view-post-con">
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="post-container">
            <div className="post-info">
              <div className="profile-name">
                <img
                  src={userProfile(
                    postOwnerData.profilePicture!,
                    postOwnerData._id
                  )}
                  alt=""
                />
                <div className="name-date">
                  <h3>{postOwnerData.fullName}</h3>
                  <span>{new Date(postData.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="post-info-act">
                <span
                  className="material-symbols-outlined more-icon"
                  ref={target}
                  onClick={() => {
                    postData.user !== currentUser._id
                      ? undefined
                      : popover.popOverToggle(postId, target);
                  }}
                >
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
                {postData.totalComments > 0 &&
                  `${postData.totalComments} Comment${
                    postData.totalComments > 1 ? "s" : ""
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
            <ViewPostCommentList
              dispatch={dispatch}
              postData={postData}
              viewUserProfile={viewUserProfile}
            />
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
        )}
      </div>
    </>
  );
};

export default ViewPost;
