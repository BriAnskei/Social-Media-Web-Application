import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbr = () => {
  return (
    <>
      <div className="navbar">
        <div>Social APP</div>
        <ul className="navbar-menu">
          <Link to={"/"}>
            <span className="material-symbols-outlined .symbols">home</span>
          </Link>
          <li>
            <span className="material-symbols-outlined">chat</span>
          </li>
          <li>
            <span className="material-symbols-outlined .symbols">
              notifications
            </span>
          </li>
          <Link to={"/profile"}>
            <span className="material-symbols-outlined .symbols">person</span>
          </Link>
        </ul>
      </div>
    </>
  );
};

export default Navbr;
