import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "../features/users/userSlice";
import authReducer from "../features/auth/authSlice";
import messageReducer from "../features/messenger/messengerSlice";
import notificationReducer from "../features/notifications/notificationsSlice";
import postReducer from "../features/posts/postSlice";
console.log(
  authReducer,
  userReducer,
  messageReducer,
  notificationReducer,
  postReducer
);
const rootReducer = combineReducers({
  user: userReducer,
  auth: authReducer,
  posts: postReducer,
  chats: messageReducer,
  notification: notificationReducer,
});

export default rootReducer;

// https://github.com/reduxjs/redux-toolkit/issues/687
