import "./Upload.css";
import { useState } from "react";
import UploadModal from "../Modal/UploadModal/UploadModal";
import { useNavigate } from "react-router";
import { useCurrentUser } from "../../hooks/useUsers";
import { userProfile } from "../../utils/ImageUrlHelper";

const Upload = () => {
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const { currentUser } = useCurrentUser();

  const toggleUpload = () => {
    setShowUpload(!showUpload);
  };

  return (
    <>
      <UploadModal showModal={showUpload} onClose={toggleUpload} />
      <div className="create-post">
        <img
          src={userProfile(currentUser.profilePicture, currentUser._id)}
          onClick={() => navigate("/profile")}
        />
        <input
          onClick={toggleUpload}
          type="text"
          placeholder={`Whats on your mind, ${currentUser.fullName.replace(
            / .*/,
            ""
          )}?`}
          readOnly
        />
        <div className="upload" onClick={toggleUpload}>
          <span className="material-symbols-outlined">add_a_photo</span>
          <span id="text">Photo</span>
        </div>
        <button onClick={toggleUpload}>CREATE</button>
      </div>
    </>
  );
};

export default Upload;
