import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Optional for Bootstrap's JS components

import Feed from "./pages/Feed/Feed";
import { Navigate, Route, Routes } from "react-router";
import MainLayout from "./layouts/MainLayout/MainLayout";

import Login from "./features/auth/Login/Login";
import Register from "./features/auth/Register/Register";
import AuthLayout from "./layouts/AuthLayout/AuthLayout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store/store";
import ProfilePage from "./pages/Profile/ProfilePage";
import { useEffect } from "react";
import { fetchCurrentUser } from "./features/users/userSlice";
import ViewPost from "./features/posts/ViewPost/Viewpost";

import ViewProfilePage from "./pages/ViewProfilePage/ViewProfilePage";
import { fetchAllPost } from "./features/posts/postSlice";
function App() {
  const dispatch = useDispatch<AppDispatch>();

  const { isAuthenticated, accessToken } = useSelector(
    (state: RootState) => state.auth
  );

  const { postId } = useSelector((state: RootState) => state.global.postData);
  const userData = useSelector(
    (state: RootState) => state.global.viewProfile.userData
  );

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser(accessToken!));
      dispatch(fetchAllPost());
    }
  }, [dispatch, isAuthenticated, accessToken]);

  return (
    <>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          {/* Protected Routes */}
          <Route
            element={
              isAuthenticated ? <MainLayout /> : <Navigate to="/login" />
            }
          >
            <Route path="/" element={<Feed />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/view/profile"
              element={<ViewProfilePage data={userData} />}
            />
            <Route path="/viewpost" element={<ViewPost postId={postId} />} />
          </Route>
          {/* Catch-All Route */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
          />
          {/* this route  will handle cases where the user tries to visit an invalid or undefined URL */}
        </Routes>
      </div>
    </>
  );
}

export default App;
