import "./Profile.css";
import { FetchedUserType } from "../../../types/user";
import { useEffect, useState } from "react";
import { useCurrentUser } from "../../../hooks/useUsers";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import {
  openEditProfileModal,
  toggleViewFollow,
} from "../../../Components/Modal/globalSlice";
import { updateFollow } from "../userSlice";
import { useSocket } from "../../../hooks/socket/useSocket";
import {
  FollowPayloadToast,
  useToastEffect,
} from "../../../hooks/toast/useToastEffect";
import { userProfile } from "../../../utils/ImageUrlHelper";

interface ProfileProp {
  data: FetchedUserType;
}

const Profile: React.FC<ProfileProp> = ({ data }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { handleFollowEffect } = useToastEffect();
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

      const payload: FollowPayloadToast = {
        followPayload: {
          userId: data._id,
          followerId: currentUser._id,
        },
        toastPayload: {
          isUnfollowing: isUserFollowed,
          userFullName: data.fullName,
        },
      };

      await handleFollowEffect(payload);

      dispatch(updateFollow(payload.followPayload));

      const emitPayload = {
        userId: data._id,
        followerId: currentUser._id,
        followingName: currentUser.fullName.match(/^\w+/)?.[0]!,
      };

      emitFollowEvent(emitPayload);
    } catch (error) {
      console.log("Error: Failed to follow: ", error);
    } finally {
      setFollowingProgress(false);
    }
  };

  const emitFollowEvent = (payload: {
    userId: string;
    followerId: string;
    followingName: string;
  }) => {
    emitFollow(payload);
  };

  const viewFollowers = () => {
    dispatch(toggleViewFollow());
  };

  return (
    <>
      <div className="profile-main">
        <img src={userProfile(data.profilePicture, data._id)} alt="" />
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
            ? followingProgress
              ? "loading..."
              : isUserFollowed
              ? "✔Followed"
              : "+ Follow"
            : "Edit Profile "}
        </button>
      </div>
    </>
  );
};

export default Profile;
