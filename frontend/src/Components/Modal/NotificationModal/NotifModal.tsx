import React from "react";
import "./NotifModal.css";
import NotificationList from "../../../features/notifications/NotificationList";
import { ModalTypes } from "../../../types/modalTypes";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

const NotifModal: React.FC<ModalTypes> = ({ showModal, onClose }) => {
  const { loading } = useSelector((state: RootState) => state.notification);

  return (
    <>
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-dialog-scrollable notif-modal-position">
          <div className="modal-content content">
            <div className="modal-header chat-header">
              <div className="chat-logo">Notification</div>
              <div className="chatt-close">
                <span onClick={() => onClose()}>X</span>
              </div>
            </div>
            <div className="modal-body body">
              {!loading && <NotificationList />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotifModal;
