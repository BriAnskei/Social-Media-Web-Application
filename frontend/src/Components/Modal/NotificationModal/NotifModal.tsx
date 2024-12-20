import React from "react";
import "./NotifModal.css";
import NotificationList from "../../../features/notifications/NotificationList";

interface Prop {
  showModal: boolean;
  onClose: () => void;
}

const NotifModal: React.FC<Prop> = ({ showModal, onClose }) => {
  return (
    <>
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-dialog-scrollable modal-post">
          <div className="modal-content content">
            <div className="modal-header chat-header">
              <div className="chat-logo">Notification</div>
              <div className="chatt-close">
                <span onClick={() => onClose()}>X</span>
              </div>
            </div>
            <div className="modal-body body">
              <NotificationList />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotifModal;
