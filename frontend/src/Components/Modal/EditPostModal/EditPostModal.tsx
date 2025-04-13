import "./EditPostModal.css";
import React, { useEffect, useRef, useState } from "react";
import { FetchPostType } from "../../../types/PostType";
import { useCurrentUser } from "../../../hooks/useUsers";
import { useGlobal } from "../../../hooks/useModal";
import { usePostById } from "../../../hooks/usePost";
import Spinner from "../../Spinner/Spinner";

interface EditPostProp {
  postId: string;
  show: boolean;
}

const EditPostModal: React.FC<EditPostProp> = ({ postId, show }) => {
  const postData = usePostById(postId);
  const { editPostModa } = useGlobal();

  const { currentUser } = useCurrentUser();
  const { profilePicture, _id, fullName } = currentUser;

  const [postInputData, setPostInputData] = useState<FetchPostType | null>(
    null
  );
  const [fontSize, setFontSize] = useState("25px");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!postData) return;

    setPostInputData(postData);
  }, [postData]);

  useEffect(() => {
    if (!postInputData) return;
    console.log("IMAGE URL", postInputData.image && isValidUrl(photoUrl!));
  }, [postInputData]);

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
      console.log(imageUrl, isValidUrl(imageUrl));

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
    editPostModa.toggleEditModal(null);
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
                  <img
                    src={`http://localhost:4000/uploads/profile/${_id}/${profilePicture}`}
                    alt=""
                  />
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
            <button>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
