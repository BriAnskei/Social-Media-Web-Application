import "./ProfilePage.css";
import Profile from "../../features/users/profile/Profile";
import { useCurrentUser } from "../../hooks/useUsers";
import CurrentUserPosts from "../../features/posts/CurrentUserPost/CurrentUserPost";
const ProfilePage = () => {
  const { currentUser } = useCurrentUser();

  return (
    <div className="profile-cont">
      <Profile data={currentUser} />
      <hr />
      <div className="uploads">
        <div>
          <span>Photos</span>
        </div>

        <div>
          <span>Vidoes</span>
        </div>
      </div>
      <CurrentUserPosts />
    </div>
  );
};

export default ProfilePage;
