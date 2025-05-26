import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "../features/users/userSlice";
import authReducer from "../features/auth/authSlice";
import contactReducer from "../features/messenger/Contact/ContactSlice";
import messageReducer from "../features/messenger/Message/messengeSlice";
import conversationReducer from "../features/messenger/Conversation/conversationSlice";
import notificationReducer from "../features/notifications/notificationsSlice";
import postReducer from "../features/posts/postSlice";
import globalReducer from "../Components/Modal/globalSlice";

const rootReducer = combineReducers({
  user: userReducer,
  auth: authReducer,
  posts: postReducer,
  contact: contactReducer,
  message: messageReducer,
  conversation: conversationReducer,
  notification: notificationReducer,
  global: globalReducer,
});

export default rootReducer;

// https://github.com/reduxjs/redux-toolkit/issues/687
