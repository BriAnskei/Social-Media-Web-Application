import "./EditProfileModal.css";
import { ModalTypes } from "../../../types/modalTypes";
import { useState } from "react";
import { NewDataType, FetchedUserType } from "../../../types/user";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { updateCurrentUser } from "../../../features/users/userSlice";

interface EditProp extends ModalTypes {
  data: FetchedUserType;
}

const EditProfileModal: React.FC<EditProp> = ({ showModal, onClose, data }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [updatedData, setUpdatedData] = useState<NewDataType>({
    fullName: "",
    bio: "",
  });

  const [profileUrl, setProfileUrl] = useState("");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files;
    if (file && file.length > 0) {
      const imageUrl = URL.createObjectURL(file[0]);
      console.log(imageUrl);
      setProfileUrl(imageUrl);

      setUpdatedData((prev) => {
        return { ...prev, profilePicture: file[0] };
      });
    }
  };

  const onChangeHandler = (e: any) => {
    const { name, value } = e.target;
    setUpdatedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const formData = new FormData();

    if (updatedData.fullName !== data.fullName && updatedData.fullName) {
      formData.append("fullName", updatedData.fullName);
    }

    if (updatedData.bio !== data.bio && updatedData.bio) {
      formData.append("bio", updatedData.bio);
    }

    if (updatedData.profilePicture) {
      formData.append("profilePicture", updatedData.profilePicture);
    }

    try {
      const response = await dispatch(updateCurrentUser(formData)).unwrap();
      if (response.success) {
        onClose();
      }
    } catch (error) {
      console.log(error);
      alert("Error: " + error);
    }
  };

  return (
    <div
      className={`modal fade ${showModal ? "show d-block" : ""} logout-modal`}
      tabIndex={-1}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-body">
            <div
              className="upload-profile image-style"
              style={{
                backgroundImage: profileUrl
                  ? `url(${profileUrl})`
                  : `url(http://localhost:4000/uploads/profile/${data._id}/${data.profilePicture})`,
              }}
            >
              <label className="custom-file-upload">
                <input type="file" onChange={handleUpload} />
                Upload new profile
              </label>
            </div>
            <div className="update-inputs">
              <label htmlFor="exampleFormControlInput1" className="form-label ">
                Fullname
              </label>
              <input
                type="text"
                className="form-control"
                placeholder={data.fullName}
                name="fullName"
                value={updatedData.fullName}
                onChange={onChangeHandler}
              />
              <label
                htmlFor="exampleFormControlTextarea1"
                className="form-label"
              >
                Bio
              </label>
              <textarea
                className="form-control"
                placeholder={data.bio}
                rows={3}
                name="bio"
                value={updatedData.bio}
                onChange={onChangeHandler}
              />
            </div>
          </div>
          <div className="modal-footer edit-footer">
            <button onClick={handleSubmit}>Save</button>
            <button
              onClick={() => {
                onClose();
                setProfileUrl("");
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
