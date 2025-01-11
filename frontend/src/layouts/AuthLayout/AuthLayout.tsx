import "./AuthLayout.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { Outlet } from "react-router";
const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="row auth-container">
        <div className="col logo-text">
          <div>
            <FontAwesomeIcon icon={faXTwitter} size="7x" />
            <span>SocioApp</span>
          </div>
        </div>
        <div className="col-7">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
