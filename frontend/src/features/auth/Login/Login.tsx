import React, { useEffect, useState } from "react";
import { LoginTypes } from "../../../types/AuthTypes";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
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

  useStyleOnInputPass(data);

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
        navigate("/"); // navigate to home page
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
            id="password"
            type="password"
            name="password"
            autoComplete="off"
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
function useStyleOnInputPass(data: LoginTypes) {
  useEffect(() => {
    const passElement = document.getElementById("password");

    if (data.password.length > 0 && passElement) {
      passElement.style.cssText = `
      font-size: 2rem;
       padding: 0.3rem 0.7rem;
      `;
    } else if (passElement) {
      // Reset to original styles when password is empty
      passElement.style.fontSize = "";
      passElement.style.padding = "";
    }
  }, [data]);
}
