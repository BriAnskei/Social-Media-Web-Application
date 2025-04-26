import "./DeletePostModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { usePostById } from "../../../hooks/usePost";

import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { removeNotifList } from "../../../features/notifications/notificationsSlice";
import { deletePost } from "../../../features/posts/postSlice";
import { useSocket } from "../../../hooks/socket/useSocket";

interface DeletePostProp {
  postId: string;
  show: boolean;
  onClose: () => void;
}

const DeletePostModal = ({ postId, show, onClose }: DeletePostProp) => {
  const dispatch = useDispatch<AppDispatch>();
  const { emitPostDelete } = useSocket();

  const postData = usePostById(postId);

  const handleDelete = async () => {
    try {
      const dataToDelete = {
        postId,
        fileName: (postData.image as string) || "",
      };

      await dispatch(deletePost(dataToDelete));
      await dispatch(removeNotifList(postId));

      emitPostDelete(postId);

      onClose();
    } catch (error) {
      console.error("Failed to delete: ", error);
    }
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

              <span onClick={() => onClose()}>Cancel</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeletePostModal;
