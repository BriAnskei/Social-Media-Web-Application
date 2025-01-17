import "./Profile.css";
import { UserTypes } from "../../../types/user";
import { useState } from "react";
import EditProfileModal from "../../../Components/Modal/EditProfileModal/EditProfileModal";

interface ProfileProp {
  data: UserTypes;
}

const Profile: React.FC<ProfileProp> = ({ data }) => {
  const [showEdit, setShowEidt] = useState(false);

  const toggleEdit = () => {
    setShowEidt(!showEdit);
  };

  return (
    <>
      <EditProfileModal showModal={showEdit} onClose={toggleEdit} data={data} />
      <div className="profile-main">
        <img
          src={`http://localhost:4000/uploads/profile/${data._id}/${data.profilePicture}`}
          alt=""
        />
        <div className="profile-info">
          <h1>{data.fullName}</h1>
          <span>{data.followers.length} Followers</span>
          <span>{data.following.length} Following</span>
          <div className="bio">
            <span>{data.bio}</span>
          </div>
        </div>
        <button onClick={toggleEdit}>Edit Profile</button>
      </div>
    </>
  );
};

export default Profile;
