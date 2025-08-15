import "./ViewProfilePage.css";
import { useNavigate } from "react-router";
import Profile from "../../features/users/profile/Profile";

import { FetchedUserType } from "../../types/user";
import { useEffect, useState } from "react";
import { useUserById } from "../../hooks/useUsers";
import { usePostsByUserId } from "../../hooks/usePost";
import ImageDisplay from "../../Components/ImageDisplay/ImageDisplay";
import UserPosts from "../../features/posts/UserPosts/UserPosts";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";

interface ViewProfileProp {
  data: FetchedUserType;
}

const ViewProfilePage = ({ data }: ViewProfileProp) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const userData = useUserById(data._id);
  const postData = usePostsByUserId(data._id);

  const [view, setView] = useState("posts");

  useEffect(() => {
    if (!(Object.keys(userData).length > 0)) {
      navigate("/");
    }
  }, [data, navigate]);

  // scroll to top when render
  useEffect(() => {
    if (window.pageYOffset > 0) {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="profile-cont">
      <Profile data={userData} />
      <hr />
      <div className="uploads user-uploads">
        <div onClick={() => setView("posts")}>
          <span>Posts</span>
        </div>

        <div onClick={() => setView("photos")}>
          <span>Photos</span>
        </div>
      </div>
      {view === "posts" ? (
        <UserPosts userId={data._id} dispatch={dispatch} />
      ) : (
        <ImageDisplay userId={data._id} />
      )}
    </div>
  );
};

export default ViewProfilePage;
