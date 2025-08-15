import "./ProfilePage.css";
import Profile from "../../features/users/profile/Profile";
import { useCurrentUser } from "../../hooks/useUsers";

import UserPosts from "../../features/posts/UserPosts/UserPosts";
import { useState } from "react";
import ImageDisplay from "../../Components/ImageDisplay/ImageDisplay";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useCurrentUser();

  const [view, setView] = useState("posts");

  return (
    <div className="profile-cont">
      <Profile data={currentUser} />
      <hr />
      <div className="uploads">
        <div onClick={() => setView("posts")}>
          <span>Posts</span>
        </div>

        <div onClick={() => setView("photos")}>
          <span>Photos</span>
        </div>
      </div>
      {view === "posts" ? (
        <UserPosts userId={currentUser._id} dispatch={dispatch} />
      ) : (
        <ImageDisplay userId={currentUser._id} />
      )}
    </div>
  );
};

export default ProfilePage;
