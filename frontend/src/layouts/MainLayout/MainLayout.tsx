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
import { toggleEditModal } from "../../Components/Modal/globalSlice";

const MainLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { show, postId } = useSelector(
    (state: RootState) => state.global.editPostModal
  );
  const { postModal, popover } = useGlobal();
  const { onClosePostModal, showPostModal } = postModal;

  const closeEditModal = () => {
    dispatch(toggleEditModal(null));
  };

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAllNotifs());
    }
  }, []);

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

      <ViewPostModal
        showModal={showPostModal}
        onClose={onClosePostModal}
        postId={postId!}
      />
      <PopoverMenu target={popover.target!} show={popover.show} />
      <EditPostModal postId={postId} show={show} onClose={closeEditModal} />
      <DeletePostModal />
    </>
  );
};

export default MainLayout;
