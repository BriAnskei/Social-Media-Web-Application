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

const MainLayout = () => {
  return (
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
  );
};

export default MainLayout;
