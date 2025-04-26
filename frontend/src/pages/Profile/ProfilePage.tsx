import "./ProfilePage.css";
import Profile from "../../features/users/profile/Profile";
import { useCurrentUser } from "../../hooks/useUsers";

import { useCurrentUserPosts } from "../../hooks/usePost";
import UserPosts from "../../features/posts/UserPosts/UserPosts";
import { useState } from "react";
import ImageDisplay from "../../Components/ImageDisplay/ImageDisplay";

const ProfilePage = () => {
  const { currentUser } = useCurrentUser();

  const { loading, currentUserPosts: posts } = useCurrentUserPosts();

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
        <UserPosts loading={loading} posts={posts} />
      ) : (
        <ImageDisplay userId={currentUser._id} />
      )}
    </div>
  );
};

export default ProfilePage;
