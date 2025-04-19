import "./Profile.css";
import { FetchedUserType } from "../../../types/user";
import { useEffect, useState } from "react";
import { useCurrentUser } from "../../../hooks/useUsers";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { openEditProfileModal } from "../../../Components/Modal/globalSlice";

interface ProfileProp {
  data: FetchedUserType;
}

const Profile: React.FC<ProfileProp> = ({ data }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useCurrentUser();
  const [followStyleId, setFollowStyleId] = useState("follow-button");
  const [isUserFollowed, setIsUserFollowed] = useState(false);

  useEffect(() => {
    if (data.followers?.includes(currentUser._id)) {
      setFollowStyleId("followed");
      setIsUserFollowed(true);
    } else {
      setFollowStyleId("follow-button");
      setIsUserFollowed(false);
    }
  }, [data, currentUser]);

  const toggleEdit = () => {
    console.log("edit toggle");
    dispatch(openEditProfileModal(data));
  };

  return (
    <>
      <div className="profile-main">
        <img
          src={`http://localhost:4000/uploads/profile/${data._id}/${data.profilePicture}`}
          alt=""
        />
        <div className="profile-info">
          <h1>{data.fullName}</h1>
          <span>{data.followers?.length} Followers</span>
          <span>{data.following?.length} Following</span>
          <div className="bio">
            <span>{data.bio}</span>
          </div>
        </div>

        <button
          id={currentUser._id !== data._id ? followStyleId : "edit-button"}
          onClick={() =>
            data._id === currentUser._id ? toggleEdit() : undefined
          }
        >
          {currentUser._id !== data._id
            ? isUserFollowed
              ? "✔ Following"
              : "+ Follow"
            : "Edit Profile "}
        </button>
      </div>
    </>
  );
};

export default Profile;
