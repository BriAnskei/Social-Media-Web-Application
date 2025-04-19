import { useNavigate } from "react-router";
import CurrentUserPosts from "../../features/posts/CurrentUserPost/CurrentUserPost";
import Profile from "../../features/users/profile/Profile";

import { FetchedUserType } from "../../types/user";
import { useEffect } from "react";

interface ViewProfileProp {
  data: FetchedUserType;
}

const ViewProfilePage = ({ data }: ViewProfileProp) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!(Object.keys(data).length > 0)) {
      navigate("/");
    }
  }, [data, navigate]);

  return (
    <div className="profile-cont">
      {data && <Profile data={data} />}
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

export default ViewProfilePage;
