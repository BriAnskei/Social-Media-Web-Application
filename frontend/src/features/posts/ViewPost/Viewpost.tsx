import "./Viewpost.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import {
  fetchPost,
  increamentComment,
  postLiked,
  toggleLike,
} from "../postSlice";
import { usePostById } from "../../../hooks/usePost";
import Spinner from "../../../Components/Spinner/Spinner";
import { useCurrentUser } from "../../../hooks/useUsers";
import { useSocket } from "../../../hooks/socket/useSocket";
import AutoResizeTextarea from "../../../utils/AutoResizeTextaria";
import { useNavigate } from "react-router";
import { FetchedUserType } from "../../../types/user";
import {
  removeViewPost,
  viewProfile,
} from "../../../Components/Modal/globalSlice";
import { usePopoverContext } from "../../../hooks/usePopover";
import { userProfile } from "../../../utils/ImageUrlHelper";
import ViewPostCommentList from "./ViewPostCommentList";
import { addComment, resetCommets } from "../../comment/commentSlice";
import { FetchPostType } from "../../../types/PostType";

interface Post {
  postId: string;
}

const ViewPost = ({ postId }: Post) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { currentUser } = useCurrentUser();

  const { emitComment } = useSocket();
  const { popover } = usePopoverContext();

  const [postData, setPostData] = useState<FetchPostType>({} as FetchPostType);

  const postOwnerData = useMemo(
    () => postData.user as FetchedUserType,
    [postData]
  );

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSucess] = useState(false); // Fetcher response, loading flag

  const [isLiked, setIsLiked] = useState(false);
  const [likeProgress, setLikeProgress] = useState(false);

  const [commentInput, setCommentInput] = useState("");

  // popover ref
  const target = useRef(null);

  useEffect(() => {
    dispatch(resetCommets(postId));

    return () => {
      dispatch(removeViewPost());
      dispatch(resetCommets(postId));
    };
  }, []);

  useEffect(() => {
    const getPostData = async (postId: string) => {
      try {
        setLoading(true);
        const res = await dispatch(fetchPost(postId)).unwrap();
        setIsSucess(res.success);
        setPostData(res.posts as FetchPostType);
      } catch (error) {
        console.log("Failed to fetch viewpost: ", error);
      } finally {
        setLoading(false);
      }
    };
    getPostData(postId);
  }, [dispatch, postId]);

  useEffect(() => {
    const isPostLiked = () => {
      if (!loading) {
        const likes = new Set(postData.likes);
        setIsLiked(likes.has(currentUser._id));
      }
    };

    isPostLiked();
  }, [postData.likes, loading]);

  const handleLike = async () => {
    try {
      if (likeProgress) return;
      setLikeProgress(true);

      await dispatch(
        toggleLike({
          postId: postData._id,
          userName: currentUser.fullName.match(/^\w+/)?.[0]!,
        })
      ).unwrap();
      toggleLikePostHanlder();

      setIsLiked(!isLiked);

      setTimeout(() => setLikeProgress(false), 200);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleLikePostHanlder = () => {
    const likes = new Set(postData.likes);

    if (likes.has(currentUser._id)) {
      likes.delete(currentUser._id);
    } else {
      likes.add(currentUser._id);
    }
    setPostData((post) => ({ ...post, likes: Array.from(likes) }));
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();

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

    emitComment(emitionPayload);

    const commentPayload = {
      postId: postId,
      user: currentUser,
      content: commentInput,
      createdAt: new Date().toISOString(),
    };

    setPostData((postData) => ({
      ...postData,
      totalComments: postData.totalComments + 1,
    }));
    dispatch(increamentComment(postId));
    dispatch(addComment(commentPayload));
    setCommentInput("");
  };

  const onKeyEvent = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent from adding new line
      submitComment(e);
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
              postId={postId}
              viewUserProfile={viewUserProfile}
            />
            <div className="comment-con-inputs">
              <div className="post-modal-profile">
                <img
                  src={userProfile(currentUser.profilePicture, currentUser._id)}
                  alt=""
                />
              </div>
              <div className="modal-input-con">
                <form
                  onSubmit={(e) => {
                    submitComment(e);
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
