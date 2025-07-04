import { ModalTypes } from "../../../types/modalTypes";
import "./DeleteConfirmation.css";

const DeleteConfirmation: React.FC<ModalTypes> = ({ showModal, onClose }) => {
  const handleDeleteCono = async () => {
    try {
    } catch (error) {}
  };

  return (
    <div
      className={`modal fade ${showModal ? "show d-block" : ""} logout-modal`}
      tabIndex={-1}
    >
      <div className="modal-dialog logout-modal-position">
        <div className="modal-content">
          <div className="modal-header">
            <FontAwesomeIcon icon={faXTwitter} />
            <span>SocioApp</span>
          </div>
          <div className="modal-body">
            <span>Are you sure you want to delete this conversation?</span>
            <span>all message data will permanently deleted</span>
            <br />
          </div>
          <div className="modal-footer">
            <span onClick={}>Yes</span>

            <span onClick={() => onClose()}>No</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
