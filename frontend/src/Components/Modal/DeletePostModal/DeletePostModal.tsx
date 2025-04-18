import "./DeletePostModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useGlobal } from "../../../hooks/useModal";
import { usePostById } from "../../../hooks/usePost";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { removeNotifList } from "../../../features/notifications/notificationsSlice";
import { deletePost } from "../../../features/posts/postSlice";

const DeletePostModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { deletePostModal } = useGlobal();
  const { toggleDeleteModal, show, postId } = deletePostModal;

  const postData = usePostById(postId);

  useEffect(() => {
    console.log("post to delete: ", postData);
  }, [postData]);

  const handleDelete = async () => {
    const dataToDelete = {
      postId,
      fileName: (postData.image as string) || "",
    };

    await dispatch(deletePost(dataToDelete));
    await dispatch(removeNotifList(postId));
    toggleDeleteModal(null);
  };

  return (
    <>
      <div
        className={`modal fade ${show ? "show d-block" : ""} logout-modal`}
        tabIndex={-1}
      >
        <div className="modal-dialog logout-modal-position">
          <div className="modal-content">
            <div className="modal-header delete-modal-header">
              <FontAwesomeIcon icon={faTrash} /> <span>Delete Post</span>
            </div>
            <div className="modal-body">
              <span>Are you sure you want to delete this post?</span>
              <br />
            </div>
            <div className="modal-footer">
              <span onClick={handleDelete}>Yes</span>

              <span onClick={() => toggleDeleteModal(null)}>Cancel</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeletePostModal;
