import Navbar from "../../Components/Navbar/Navbr";
import "./MainLayout.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faFacebook,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";

import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <main>
        <div className="main-container">
          <div className="create-post">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTv9vTXdwwkpbReYqTda51_edFZyXLiAruItw&s"
              alt=""
            />
            <input type="text" placeholder="Whats on your mind, Name?" />
            <div className="upload">
              <span className="material-symbols-outlined">add_a_photo</span>
              <span id="text">Photo/Video</span>
            </div>
            <button>POST</button>
          </div>
          <Outlet />
        </div>
      </main>
      <footer>
        <div className="footer-container">
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
      </footer>
    </div>
  );
};

export default MainLayout;
