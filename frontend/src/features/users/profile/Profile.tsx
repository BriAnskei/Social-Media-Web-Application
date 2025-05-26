import "./Profile.css";
import { FetchedUserType, FollowPayload } from "../../../types/user";
import { useEffect, useState } from "react";
import { useCurrentUser } from "../../../hooks/useUsers";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import {
  openEditProfileModal,
  toggleViewFollow,
} from "../../../Components/Modal/globalSlice";
import { followToggled, updateFollow } from "../userSlice";
import { useSocket } from "../../../hooks/socket/useSocket";

interface ProfileProp {
  data: FetchedUserType;
}

const Profile: React.FC<ProfileProp> = ({ data }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useCurrentUser();
  const [followStyleId, setFollowStyleId] = useState("follow-button");
  const [isUserFollowed, setIsUserFollowed] = useState(false);

  // Api loading for follow
  const [followingProgress, setFollowingProgress] = useState(false);

  const { emitFollow } = useSocket();

  useEffect(() => {
    if (data.followers?.includes(currentUser._id)) {
      setFollowStyleId("followed");
      setIsUserFollowed(true);
    } else {
      setFollowStyleId("follow-button");
      setIsUserFollowed(false);
    }
  }, [data, currentUser]);

  const toggleEdit = async () => {
    dispatch(openEditProfileModal(data));
  };

  const handleFollow = async () => {
    try {
      if (followingProgress) return;
      setFollowingProgress(true);

      const dataPayload: FollowPayload = {
        userId: data._id,
        followerId: currentUser._id,
      };

      const res = await dispatch(followToggled(dataPayload)).unwrap();

      if (!res.success) {
        console.error(res.message || "Faild to follow use");
        return;
      }

      const emitPayload = {
        userId: data._id,
        followerId: currentUser._id,
        followingName: currentUser.fullName,
      };

      emitFollow(emitPayload);
    } catch (error) {
      console.log("Error: Failed to follow: ", error);
    } finally {
      setFollowingProgress(false);
    }
  };

  const viewFollowers = () => {
    dispatch(
      toggleViewFollow({ followers: data.followers, following: data.following })
    );
  };

  const imgUrl =
    data.profilePicture !== ""
      ? `http://localhost:4000/uploads/profile/${data._id}/${data.profilePicture}`
      : "http://localhost:4000/no-profile/no-profile.jpg";

  return (
    <>
      <div className="profile-main">
        <img src={imgUrl} alt="" />
        <div className="profile-info">
          <h1>{data.fullName}</h1>
          <div
            className="followers"
            style={{ cursor: "pointer" }}
            onClick={viewFollowers}
          >
            <span>{data.followers?.length} Followers</span>
            <span>{data.following?.length} Following</span>
          </div>
          <div className="bio">
            <span>{data.bio}</span>
          </div>
        </div>

        <button
          id={currentUser._id !== data._id ? followStyleId : "edit-button"}
          onClick={() =>
            data._id === currentUser._id ? toggleEdit() : handleFollow()
          }
        >
          {currentUser._id !== data._id
            ? isUserFollowed
              ? "✔Followed"
              : "+ Follow"
            : "Edit Profile "}
        </button>
      </div>
    </>
  );
};

export default Profile;
