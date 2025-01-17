import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "../features/users/userSlice";
import authReducer from "../features/auth/authSlice";
import postsReducer from "../features/posts/postSlice";
import messageReducer from "../features/messenger/messengerSlice";
import notificationReducer from "../features/notifications/notificationsSlice";

const rootReducer = combineReducers({
  user: userReducer,
  auth: authReducer,
  posts: postsReducer,
  chats: messageReducer,
  notification: notificationReducer,
});

export default rootReducer;
