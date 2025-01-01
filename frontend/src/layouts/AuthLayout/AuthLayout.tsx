import Login from "../../features/auth/Login/Login";
import "./AuthLayout.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";
const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="row auth-container">
        <div className="col logo-text">
          <FontAwesomeIcon icon={faXTwitter} size="7x" />
          <span>SocioApp</span>
        </div>
        <div className="col-7">
          <Login />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
