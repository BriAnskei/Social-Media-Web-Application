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
import toast from "react-hot-toast";

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

      dispatch(updateFollow(dataPayload));

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

  const followToggle = () => {
    toast.promise(
      handleFollow(),
      {
        loading: "Loading...",
        success: (
          <b>
            {`You ${
              isUserFollowed ? "Unfollowed" : "Followed"
            } ${data.fullName.replace(/ .*/, "")}`}
            !
          </b>
        ),
        error: <b>Failed to follow this user.</b>,
      },
      {
        success: {
          style: {
            border: "2px solidrgb(70, 74, 72)",
            padding: "13px",
            color: "black",
            backgroundColor: "white",
          },
          iconTheme: {
            primary: "#10b981",
            secondary: "black",
          },
        },
      }
    );
  };

  const viewFollowers = () => {
    dispatch(toggleViewFollow());
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
            data._id === currentUser._id ? toggleEdit() : followToggle()
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
