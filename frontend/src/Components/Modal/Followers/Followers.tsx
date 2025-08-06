import "./Followers.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";

import { useCurrentUser, useUsersById } from "../../../hooks/useUsers";
import { toggleViewFollow } from "../globalSlice";
import { useEffect, useState } from "react";
import { FetchedUserType, FollowPayload } from "../../../types/user";
import { userProfile } from "../../../utils/ImageUrlHelper";
import { followToggled } from "../../../features/users/userSlice";
import { useSocket } from "../../../hooks/socket/useSocket";
import { followEvent } from "../../../types/SocketTypes";

const Followers = () => {
  const { currentUser } = useCurrentUser();
  const dispatch = useDispatch<AppDispatch>();
  const { show } = useSelector((state: RootState) => state.global.viewFollow);
  const { emitFollow } = useSocket();

  const [apiProgess, setApiProgress] = useState(false);
  const [display, setDisplay] = useState("follower");
  const [ids, setIds] = useState<string[]>([]);
  const [userData, setUserData] = useState<{
    [key: string]: FetchedUserType;
  }>({});

  const userFollower = useUsersById(currentUser.followers) || [];
  const userFollowing = useUsersById(currentUser.following) || [];

  useEffect(() => {
    if (display == "follower") {
      setIds(currentUser.followers);
      setUserData(userFollower);
    } else if (display == "following") {
      setIds(currentUser.following);
      setUserData(userFollowing);
    }
  }, [show, display, currentUser]);

  const onClose = () => {
    setDisplay("follower");
    dispatch(toggleViewFollow());
  };

  const onFollow = async (
    e: any,
    userId: string,
    type: string,
    fullName: string
  ) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      if (apiProgess) return;
      setApiProgress(true);
      const currUserId: string = currentUser._id;

      let data: FollowPayload = {} as FollowPayload;
      let emitPayload: followEvent = {} as followEvent;

      if (type === "follower") {
        // removing user from follower
        data = {
          userId: currUserId,
          followerId: userId,
        };

        emitPayload = {
          userId: currUserId,
          followerId: userId,
          followingName: fullName,
        };
      } else if (type === "following") {
        data = {
          userId,
          followerId: currUserId,
        };
        emitPayload = {
          userId: userId,
          followerId: currUserId,
          followingName: currentUser.fullName.match(/^\w+/)?.[0]!,
        };
      }

      const res = await dispatch(followToggled(data)).unwrap();
      if (!res.success) {
        console.error("Failed to toggle follow: ", res.message || "Error");
        return;
      }

      // only  emit if removing following, reason for this is we dont want to update
      // the state through use socket if the user remove followers.(causing the the ui update function to be called twice)
      if (type === "following") {
        emitFollow(emitPayload);
      }
    } catch (error) {
      console.log("Failed to toggle follow: ", error || "Failed");
    } finally {
      setApiProgress(false);
    }
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : ""} logout-modal`}
      tabIndex={-1}
    >
      <div className="modal-dialog">
        <div className="modal-content follower-content">
          <div className="follower-header">
            <div className="follower-nav">
              <span
                className={`${display === "follower" && "active-follow"}`}
                onClick={() => setDisplay("follower")}
              >
                Follower
              </span>
              <span
                className={`${display === "following" && "active-follow"}`}
                onClick={() => setDisplay("following")}
              >
                Following
              </span>
            </div>
            <span onClick={() => onClose()}>x</span>
          </div>
          <div
            className={`followers-container ${
              ids.length === 0 ? "center" : ""
            }`}
          >
            {ids.length === 0 ? (
              <>No {display}</>
            ) : (
              ids.map((id, index) => {
                const currData = userData[id];
                return (
                  <div key={index} className="user-follow-container">
                    <div className="user-follow-data">
                      <img
                        src={userProfile(currData.profilePicture!, id)}
                        alt=""
                      />
                      <span>
                        {currData.fullName} ({currData.username})
                      </span>
                    </div>
                    <button
                      className="toggle-button"
                      onClick={(e) =>
                        onFollow(e, id, display, currData.fullName)
                      }
                    >{`${
                      display === "follower" ? "remove" : "unfollow"
                    }`}</button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Followers;
