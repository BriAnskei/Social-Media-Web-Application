import "./EditPostModal.css";
import React, { useEffect, useRef, useState } from "react";
import { FetchPostType } from "../../../types/PostType";
import { useCurrentUser } from "../../../hooks/useUsers";
import { usePostById } from "../../../hooks/usePost";
import Spinner from "../../Spinner/Spinner";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { updatePost } from "../../../features/posts/postSlice";
import { PostUpdateEvent, useSocket } from "../../../hooks/socket/useSocket";
import { userProfile } from "../../../utils/ImageUrlHelper";

interface EditPostProp {
  postId: string;
  show: boolean;
  onClose: () => void;
}

const EditPostModal: React.FC<EditPostProp> = ({ postId, show, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { emitPostUpdate } = useSocket();
  const postData = usePostById(postId);

  const { currentUser } = useCurrentUser();
  const { profilePicture, _id, fullName } = currentUser;

  const [postInputData, setPostInputData] = useState<FetchPostType | null>(
    null
  );
  const [fontSize, setFontSize] = useState("25px");
  879;
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [deleteField, setDeletedField] = useState<{
    contentDeleted: boolean;
    imageDeleted: boolean;
  }>({ contentDeleted: false, imageDeleted: false });

  useEffect(() => {
    if (!postData) return;

    setPostInputData(postData);
  }, [postData]);

  const onChangeHandler = (e: any) => {
    const { name, value } = e.target;
    // Texterea input size
    const textArea = textAreaRef.current;
    if (textArea) {
      const newFontSize = textArea.value.length <= 30 ? "25px" : "15px";
      setFontSize(newFontSize);
    }

    setPostInputData((prev) => {
      if (prev) {
        return {
          ...prev,
          [name]: value,
        };
      }
      return null;
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files;
    if (file && file.length > 0) {
      const imageUrl = URL.createObjectURL(file[0]);

      setPhotoUrl(imageUrl);
      setPostInputData((prev) => {
        if (prev) {
          return {
            ...prev,
            image: file[0],
          };
        }
        return null;
      });
    }
  };

  const onCloseModal = () => {
    setPhotoUrl(null);
    setPostInputData(null);
    setDeletedField((prev) => ({
      ...prev,
      contentDeleted: false,
      imageDeleted: false,
    }));
    onClose();
  };

  function isValidUrl(str: string) {
    try {
      new URL(str);
      return true;
    } catch (err) {
      return false;
    }
  }

  const deletePhoto = () => {
    setPostInputData((prev) => {
      if (prev) {
        return {
          ...prev,
          image: "",
        };
      }
      return null;
    });
    setDeletedField((prev) => ({ ...prev, imageDeleted: true }));
  };

  const submitChanges = async (e: any) => {
    try {
      e.preventDefault();
      const form = new FormData();

      if (!postInputData?.content && !postInputData?.image) return;

      if (postInputData?.image && typeof postInputData.image !== "string") {
        form.append("image", postInputData.image);
      }

      if (postData.image && deleteField.imageDeleted) {
        form.append("deletedImage", "true");
        form.append("oldFileName", postData.image);
      }

      if (postInputData?.content || postData.content) {
        if (postInputData?.content) {
          if (postData.content !== postInputData.content) {
            form.append("content", postInputData.content);
          }
        }

        if (postInputData!.content.length === 0) {
          form.append("deletedContent", "true");
        }
      }

      const data = {
        data: form,
        postId,
      };

      const res = await dispatch(updatePost(data)).unwrap();

      if (!res || !res.success) {
        console.error(
          "Response to update post might be empty, or failed to updated it"
        );
        return;
      }

      const updateData = res.posts as FetchPostType;

      const emitPayload: PostUpdateEvent = {
        data: updateData,
      };

      emitPostUpdate(emitPayload);
      onClose();
    } catch (error) {
      console.log("Error submiting changes: " + error);
    }
  };
  return (
    <div className={`modal fade ${show ? "show d-block" : ""} edit-post-modal`}>
      <div className="modal-dialog upload-modal-position">
        <div className="modal-content edit-post-modal-content">
          <div className="modal-header upload-header">
            <div className="post-logo">Edit Post</div>
            <div className="chatt-close">
              <span onClick={onCloseModal}>X</span>
            </div>
          </div>
          <div className="modal-body create-post-body">
            {!postInputData ? (
              <Spinner />
            ) : (
              <div className="create-post-container">
                <div className="user-logo">
                  <img src={userProfile(profilePicture, _id)} alt="" />
                  <span>{fullName}</span>
                </div>

                <div className="post-input">
                  <textarea
                    className="form-control post-input"
                    placeholder={`Whats on your mind, ${fullName.replace(
                      / .*/,
                      ""
                    )}?`}
                    rows={3}
                    ref={textAreaRef}
                    style={{ fontSize }}
                    onChange={onChangeHandler}
                    name="content"
                    value={postInputData.content}
                  />

                  <div
                    className={`image-prev-border ${
                      postInputData.image ? "" : "image-border-no-image"
                    }`}
                  >
                    {postInputData.image && postInputData.user ? (
                      <div className="image-prev-container">
                        <div
                          className="edit-post-image-preview "
                          style={{
                            // put encodeURI for spacing in file name
                            backgroundImage: `${
                              postInputData.image && isValidUrl(photoUrl!)
                                ? `url(${photoUrl})`
                                : `url(${encodeURI(
                                    `http://localhost:4000/images/posts/${postInputData.user}/${postInputData.image}`
                                  )})`
                            }`,
                          }}
                        >
                          <label className="image-prev-action">
                            <span
                              className="material-symbols-outlined"
                              onClick={deletePhoto}
                            >
                              delete
                            </span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="edit-post-upload">
                        <input type="file" onChange={handleUpload} />
                        Upload a new image
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer modal-post-footer">
            <button onClick={submitChanges}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
