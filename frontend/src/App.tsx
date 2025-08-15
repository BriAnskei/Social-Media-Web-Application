import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Feed from "./pages/Feed/Feed";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router";
import MainLayout from "./layouts/MainLayout/MainLayout";
import Login from "./features/auth/Login/Login";
import Register from "./features/auth/Register/Register";
import AuthLayout from "./layouts/AuthLayout/AuthLayout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store/store";
import ProfilePage from "./pages/Profile/ProfilePage";
import { useCallback, useEffect, useRef } from "react";
import { fetchCurrentUser } from "./features/users/userSlice";
import ViewPost from "./features/posts/ViewPost/Viewpost";
import ViewProfilePage from "./pages/ViewProfilePage/ViewProfilePage";
import { fetchAllPost } from "./features/posts/postSlice";
import { Toaster } from "react-hot-toast";
import { viewPost } from "./Components/Modal/globalSlice";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation(); // Add this hook
  const hasRecovered = useRef(false); // Prevent multiple recoveries

  const { isAuthenticated, accessToken } = useSelector(
    (state: RootState) => state.auth
  );

  const { postId } = useSelector((state: RootState) => state.global.postData);
  const userData = useSelector(
    (state: RootState) => state.global.viewProfile.userData
  );

  // Save current route and data before page unload
  const saveViewPostRoute = useCallback(() => {
    if (postId) {
      const viewPostObjectRoute = {
        postId,
        path: "/viewpost",
        timestamp: Date.now(),
      };
      localStorage.setItem("viewPost", JSON.stringify(viewPostObjectRoute));
    }
  }, [postId, location.pathname, isAuthenticated]);

  // Recover previous session
  const handleRecoverPathLoc = useCallback(() => {
    if (!isAuthenticated || hasRecovered.current) return;

    // Check for specific post view recovery
    const viewPostLastSession = localStorage.getItem("viewPost");
    if (viewPostLastSession) {
      try {
        const viewPostData = JSON.parse(viewPostLastSession);

        dispatch(viewPost(viewPostData.postId));
        navigate("/viewpost", { replace: true });
        console.log("Recovered post view: ", viewPostData);
        hasRecovered.current = true;
        localStorage.removeItem("viewPost");
        return;
      } catch (error) {
        console.error("Error parsing viewPost data:", error);
      }
      localStorage.removeItem("viewPost");
    }
  }, [isAuthenticated, dispatch, navigate]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveViewPostRoute();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveViewPostRoute]);

  // Handle session recovery when authenticated
  useEffect(() => {
    if (isAuthenticated && !hasRecovered.current) {
      // Small delay to ensure all data is loaded
      const timer = setTimeout(() => {
        handleRecoverPathLoc();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, handleRecoverPathLoc]);

  // Fetch user data and posts when authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      dispatch(fetchCurrentUser(accessToken));
      dispatch(fetchAllPost({}));
    }
  }, [dispatch, isAuthenticated, accessToken]);

  // Reset recovery flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      hasRecovered.current = false;
      // Clean up any stored session data on logout
      localStorage.removeItem("viewPost");
      localStorage.removeItem("lastRoute");
    }
  }, [isAuthenticated]);

  return (
    <>
      <div className="app">
        <Toaster position="top-right" reverseOrder={false} />
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
        </Routes>
      </div>
    </>
  );
}

export default App;
