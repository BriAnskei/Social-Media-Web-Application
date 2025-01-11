import "./Register.css";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { RegisterTypes } from "../../../types/AuthTypes";
import { AppDispatch, RootState } from "../../../store/store";
import { registerAuth } from "../authSlice";

interface PropTypes {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profilePicture?: File;
}

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  console.log(loading, error, isAuthenticated);

  const [data, setData] = useState<PropTypes>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const onChangeHandler = (e: any) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Return PropTypes as an RegistrationTypes, 'fullName'
  const manipulateType = (formData: PropTypes): RegisterTypes => {
    const { firstName, lastName, ...rest } = formData; // (Spread Op)...rest: the rest of the prop
    return {
      ...rest,
      fullName: `${firstName.trim()} ${lastName.trim()}`,
    };
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files;
    if (file && file.length > 0) {
      console.log("File Selected: ", file[0]);
      setData((prev) => {
        return { ...prev, profilePicture: file[0] };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = manipulateType(data);

    try {
      const response = await dispatch(registerAuth(formData)).unwrap();

      if (response.token) {
        navigate("/");
      } else {
        console.error("Unexpected API response:", response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="regiter-container">
      <form className="registration-inputs" onSubmit={handleSubmit}>
        <div className="flex-input">
          <input
            id="text-input"
            type="text"
            placeholder="first name"
            onChange={onChangeHandler}
            value={data.firstName}
            name="firstName"
          />
          <input
            id="text-input"
            type="text"
            placeholder="last name"
            onChange={onChangeHandler}
            value={data.lastName}
            name="lastName"
          />
        </div>
        <div className="flex-input file-upload-container">
          <input
            id="text-input"
            placeholder="username"
            type="text"
            onChange={onChangeHandler}
            value={data.username}
            name="username"
          />
          <div className="file-upload">
            <label htmlFor="">Profile Picture</label>
            <input
              className="form-control file-upload-input"
              type="file"
              id="formFile"
              onChange={handleUpload}
              name="profilePicture"
            />
          </div>
        </div>
        <hr />

        <div className="credintials">
          <div>
            <label htmlFor="">Email</label>
            <input
              type="text"
              name="email"
              onChange={onChangeHandler}
              value={data.email}
            />
          </div>

          <div className="password-input">
            <label htmlFor="">Password</label>
            <input
              type="text"
              name="password"
              onChange={onChangeHandler}
              value={data.password}
            />
          </div>
        </div>
        <div className="registration-act">
          <button type="submit">Sign in</button>
          <span>
            Alrady have an account? <Link to={"/Login"}>Sign up</Link>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Register;
