import React, { useEffect, useState } from "react";
import { LoginTypes } from "../../../types/AuthTypes";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { clearError, loginAuth } from "../authSlice";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [data, setData] = useState<LoginTypes>({
    email: "",
    password: "",
  });

  const [isInputInvalid, setIsInputInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onChangeHandler = (e: any) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsInputInvalid(false);
    setErrorMessage("");
    dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const resultAction = await dispatch(loginAuth(data)).unwrap();
      // unwrap method, part of redux createAsyncThunk that returns the payload of the response

      if (resultAction.token && resultAction.success) {
        navigate("/");
      } else {
        console.error("Unexpected API response:", resultAction);
      }
    } catch (error) {
      setIsInputInvalid(true);
      setErrorMessage(error as string);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <div className="login-inputs">
          <input
            type="text"
            name="email"
            onChange={onChangeHandler}
            placeholder="email"
            required
          />

          <input
            type="text"
            name="password"
            onChange={onChangeHandler}
            placeholder="password"
            required
          />

          {isInputInvalid && (
            <div className="login-invalid">
              <span>
                <b>Error: </b>
                {errorMessage}
              </span>
            </div>
          )}

          <div className="login-act">
            <button type="submit">Sign in</button>
            <span>
              Dont have an account? <Link to={"/register"}>Sign up</Link>
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
