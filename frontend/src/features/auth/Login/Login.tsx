import React, { useState } from "react";
import { LoginInputs } from "../../../types/AuthTypes";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { loginAuth } from "../authSlice";
import { useNavigate } from "react-router";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [data, setData] = useState<LoginInputs>({
    email: "",
    password: "",
  });

  const [isInputInvalid, setIsInputInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  console.log(loading, error);

  const onChangeHandler = (e: any) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsInputInvalid(false);
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const resultAction = await dispatch(loginAuth(data)).unwrap();
      // unwrap method, part of redux createAsyncThunk that returns the payload of the response

      if (resultAction.token) {
        console.log(resultAction);
        navigate("/");
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
            <button type="submit">Login</button>
            <span>
              Dont have an account? <a href="">Sign up</a>
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
