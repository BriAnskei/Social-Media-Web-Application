import React, { useRef, useState } from "react";
import "./UploadModal.css";
import { ModalTypes } from "../../../types/modalTypes";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { UploadPostTypes } from "../../../types/PostType";
import { createPost } from "../../../features/posts/postSlice";
import { useCurrentUser } from "../../../hooks/useCorrentUser";

const UploadModal: React.FC<ModalTypes> = ({ showModal, onClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const { currentUser } = useCurrentUser();
  const { profilePicture, _id, fullName } = currentUser;

  const [postInputData, setPostInputData] = useState<UploadPostTypes>({
    content: "",
  });
  const [fontSize, setFontSize] = useState("25px");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files;
    if (file && file.length > 0) {
      setPostInputData((prev) => {
        return { ...prev, image: file[0] };
      });
    }
  };

  const onChangeHandler = (e: any) => {
    const { name, value } = e.target;
    // Texterea input size
    const textArea = textAreaRef.current;
    if (textArea) {
      const newFontSize = textArea.value.length <= 30 ? "25px" : "15px";
      setFontSize(newFontSize);
    }

    setPostInputData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const formData = new FormData();

    if (!postInputData.content) return; // No post content

    formData.append("content", postInputData.content);
    if (postInputData.image) {
      formData.append("image", postInputData.image);
    }
    try {
      const response = await dispatch(createPost(formData)).unwrap();

      if (response.success) {
        setPostInputData(() => ({
          content: "",
          image: undefined,
        }));
        onClose(); // CLose the modal after posting
      }
    } catch (error) {
      alert("dsfsdfdssdf: " + error);
      onClose();
    }
  };

  return (
    <div
      className={`modal fade ${
        showModal ? "show d-block" : ""
      } createpost-modal`}
    >
      <div className="modal-dialog upload-modal-position">
        <div className="modal-content post-modal-content">
          <div className="modal-header upload-header">
            <div className="post-logo">Create post</div>
            <div className="chatt-close">
              <span onClick={() => onClose()}>X</span>
            </div>
          </div>
          <div className="modal-body create-post-body">
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
                <input
                  className="form-control"
                  type="file"
                  name="image"
                  onChange={handleUpload}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer modal-post-footer">
            <button onClick={handleSubmit}>Create Post</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
