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
import { useModal } from "../../hooks/useModal";
import ViewPostModal from "../../Components/Modal/ViewPostModal/ViewPostModal";
import PopoverMenu from "../../Components/Popover/Popover";

const MainLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { postModal, popover } = useModal();
  const { onClosePostModal, postId, showPostModal } = postModal;

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAllNotifs());
    }
  }, []);

  return (
    <>
      <div>
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
      </div>
      <ViewPostModal
        showModal={showPostModal}
        onClose={onClosePostModal}
        postId={postId!}
      />
      <PopoverMenu target={popover.target!} show={popover.show} />
    </>
  );
};

export default MainLayout;
