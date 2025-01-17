import React from "react";
import "./UploadModal.css";
import { ModalTypes } from "../../../types/modalTypes";

const UploadModal: React.FC<ModalTypes> = ({ showModal, onClose }) => {
  return (
    <div
      className={`modal fade ${
        showModal ? "show d-block" : ""
      } createpost-modal`}
    >
      <div className="modal-dialog upload-modal-position">
        <div className="modal-content">
          <div className="modal-header upload-header">
            <div className="post-logo">Create post</div>
            <div className="chatt-close">
              <span onClick={() => onClose()}>X</span>
            </div>
          </div>
          <div className="modal-body">
            <span>TRhisis body</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
