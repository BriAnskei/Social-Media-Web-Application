import "./ProfilePage.css";
import PostList from "../../features/posts/PostList/PostList";

import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { UserTypes } from "../../types/user";
import Profile from "../../features/users/profile/Profile";

const ProfilePage = () => {
  const userData: UserTypes = useSelector(
    (state: RootState) => state.user.user
  );

  console.log(userData);

  return (
    <div className="profile-cont">
      <Profile data={userData} />
      <hr />
      <div className="uploads">
        <div>
          <span>Photos</span>
        </div>

        <div>
          <span>Vidoes</span>
        </div>
      </div>
      <PostList />
    </div>
  );
};

export default ProfilePage;
