import Navbar from "../../Components/Navbar/Navbr";
import "./MainLayout.css";
import { Outlet } from "react-router";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faFacebook,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import Upload from "../../Components/Upload/Upload";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchAllNotifs } from "../../features/notifications/notificationsSlice";
import { useGlobal } from "../../hooks/useModal";
import ViewPostModal from "../../Components/Modal/ViewPostModal/ViewPostModal";
import PopoverMenu from "../../Components/Popover/Popover";
import EditPostModal from "../../Components/Modal/EditPostModal/EditPostModal";
import DeletePostModal from "../../Components/Modal/DeletePostModal/DeletePostModal";
import {
  closeEditProfileModal,
  closePostModal,
  toggleDeleteModal,
  toggleEditModal,
} from "../../Components/Modal/globalSlice";
import EditProfileModal from "../../Components/Modal/EditProfileModal/EditProfileModal";
import ViewImage from "../../Components/Modal/ViewImage/ViewImage";

import MessageBox from "../../features/messenger/Message/MessageBox";
import Followers from "../../Components/Modal/Followers/Followers";

const MainLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { show: showEditProfileModal, data } = useSelector(
    (state: RootState) => state.global.editProfileModal
  );

  const { show: showEditModal, postId: postIdEdit } = useSelector(
    (state: RootState) => state.global.editPostModal
  );

  const { show: showDeleteModal, postId: postIdDelete } = useSelector(
    (state: RootState) => state.global.deletePostModal
  );

  const { showPostModal, postId: viewPostModalId } = useSelector(
    (state: RootState) => state.global.postModal
  );

  const { show: viewImageShow, src } = useSelector(
    (state: RootState) => state.global.viewImageModal
  );

  const { chatWindow } = useSelector((state: RootState) => state.global);
  const { popover } = useGlobal();

  const closeEditProfModal = () => {
    dispatch(closeEditProfileModal());
  };

  const closePostModalToggle = () => {
    dispatch(closePostModal());
  };

  const closeEditModal = () => {
    dispatch(toggleEditModal(null));
  };

  const closeDeleteModal = () => {
    dispatch(toggleDeleteModal(null));
  };

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAllNotifs());
    }
  }, []);

  // chat funtion
  const onClose = (id: string) => {};
  const toggleMinimized = (id: string) => {};
  const onSendMessage = (id: string, content: string) => {};

  return (
    <>
      <Navbar />
      <main>
        <div className="main-container">
          <Upload />
          <Outlet />
        </div>
      </main>
      <footer>
        <div className="footer-container">
          <div className="footer-content">
            <div className="company">
              <h4>Company</h4>
              <span>Careers</span>
              <br />
              <span>Contact us</span>
            </div>
            <div className="info">
              <h4>Further information</h4>
              <span>Teams & Condition</span>
              <br />
              <span>Privacy Policy</span>
              <br />
            </div>
            <div className="follow">
              <h4>Follow me</h4>
              <span>
                <FontAwesomeIcon icon={faGithub} />
              </span>
              <span>
                <FontAwesomeIcon icon={faFacebook} />
              </span>
              <span>
                <FontAwesomeIcon icon={faInstagram} />
              </span>
            </div>
          </div>
        </div>
      </footer>

      <EditProfileModal
        showModal={showEditProfileModal}
        onClose={closeEditProfModal}
        data={data}
      />

      <ViewPostModal
        showModal={showPostModal}
        onClose={closePostModalToggle}
        postId={viewPostModalId}
      />
      <PopoverMenu target={popover.target!} show={popover.show} />
      <EditPostModal
        postId={postIdEdit}
        show={showEditModal}
        onClose={closeEditModal}
      />
      <DeletePostModal
        postId={postIdDelete}
        show={showDeleteModal}
        onClose={closeDeleteModal}
      />

      <ViewImage show={viewImageShow} src={src} />

      <Followers />

      {/* chat window */}
      <div className="chat-windows-container">
        {chatWindow.chatWWindows.map((chat, index) => (
          <MessageBox
            key={index}
            chat={chat}
            onClose={onClose}
            toggleMin={toggleMinimized}
            onSendMessage={onSendMessage}
          />
        ))}
      </div>
    </>
  );
};

export default MainLayout;
