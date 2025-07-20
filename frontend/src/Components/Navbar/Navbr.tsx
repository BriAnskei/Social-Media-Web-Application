import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import LogoutModal from "../Modal/LogoutModal/LogoutModal";

import SuggestionInput from "../SuggestionInput/suggestionInput";
import { FetchedUserType } from "../../types/user";
import { viewProfile } from "../Modal/globalSlice";
import { useCurrentUser } from "../../hooks/useUsers";
import { useLocation } from "react-router";
import { fetchAllPost } from "../../features/posts/postSlice";

import NavControl from "./NavControl";
import { useUnreadNotif } from "../../hooks/useUnreadNotif";

const Navbr = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const location = useLocation(); // validating for homepage refresh
  const unReadNotifPayload = useUnreadNotif();

  const [showLogout, setShowLogout] = useState(false);

  const toggleLogout = () => {
    setShowLogout(!showLogout);
  };

  const handleOnSeach = (data: FetchedUserType) => {
    if (data._id === currentUser._id) {
      navigate("/profile");
    } else {
      dispatch(viewProfile(data));
      navigate("/view/profile");
    }
  };

  const onPageRefresh = async () => {
    const { pathname } = location;

    if (pathname === "/") {
      if (window.pageYOffset === 0) {
        await homePageOnFetch();
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      navigate("/");
    }
  };

  const homePageOnFetch = async () => {
    try {
      await dispatch(fetchAllPost());
    } catch (error) {
      console.log("Error refreshing post: ", error);
    }
  };

  return (
    <>
      <div className="navbar">
        <div className="logo">
          <span>Social App</span>
          <div className="suggestion-wrapper">
            <SuggestionInput onSelect={handleOnSeach} />
          </div>
        </div>
        <div className="navbar-act">
          <NavControl
            onPageRefresh={onPageRefresh}
            notificationProp={unReadNotifPayload}
            dispatch={dispatch}
          />
          <div className="logout">
            <span onClick={toggleLogout}>Logout</span>
          </div>
        </div>
      </div>
      <LogoutModal showModal={showLogout} onClose={toggleLogout} />
    </>
  );
};

export default Navbr;
