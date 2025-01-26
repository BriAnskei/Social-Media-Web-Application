import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { UserTypes } from "../../types/user";
import "./Upload.css";
import { useState } from "react";
import UploadModal from "../Modal/UploadModal/UploadModal";
import { useNavigate } from "react-router";

const Upload = () => {
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const userData: UserTypes = useSelector(
    (state: RootState) => state.user.user
  );

  const toggleUpload = () => {
    setShowUpload(!showUpload);
  };

  return (
    <>
      <UploadModal showModal={showUpload} onClose={toggleUpload} />
      <div className="create-post">
        <img
          src={`http://localhost:4000/uploads/profile/${userData._id}/${userData.profilePicture}`}
          alt=""
          onClick={() => navigate("/profile")}
        />
        <input
          onClick={toggleUpload}
          type="text"
          placeholder={`Whats on your mind, ${userData.fullName.replace(
            / .*/,
            ""
          )}?`}
        />
        <div className="upload" onClick={toggleUpload}>
          <span className="material-symbols-outlined">add_a_photo</span>
          <span id="text">Photo/Video</span>
        </div>
        <button onClick={toggleUpload}>CREATE</button>
      </div>
    </>
  );
};

export default Upload;
