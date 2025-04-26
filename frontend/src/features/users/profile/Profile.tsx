import "./Profile.css";
import { FetchedUserType, FollowPayload } from "../../../types/user";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "../../../hooks/useUsers";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { openEditProfileModal } from "../../../Components/Modal/globalSlice";
import { followToggled, updateFollow } from "../userSlice";
import { useSocket } from "../../../hooks/socket/useSocket";

interface ProfileProp {
  data: FetchedUserType;
}

//https://claude.ai/chat/72f48cbd-3dcf-43f7-abb2-14691442d42c

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
      dispatch(updateFollow(dataPayload));

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
