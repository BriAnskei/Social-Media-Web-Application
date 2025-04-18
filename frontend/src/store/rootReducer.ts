import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "../features/users/userSlice";
import authReducer from "../features/auth/authSlice";
import messageReducer from "../features/messenger/messengerSlice";
import notificationReducer from "../features/notifications/notificationsSlice";
import postReducer from "../features/posts/postSlice";
import globalReducer from "../Components/Modal/globalSlice";

const rootReducer = combineReducers({
  user: userReducer,
  auth: authReducer,
  posts: postReducer,
  chats: messageReducer,
  notification: notificationReducer,
  global: globalReducer,
});

export default rootReducer;

// https://github.com/reduxjs/redux-toolkit/issues/687
