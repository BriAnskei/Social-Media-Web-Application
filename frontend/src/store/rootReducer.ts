import { combineReducers } from "@reduxjs/toolkit";
import postsReducer from '../features/posts/postSlice'
import messageReducer from '../features/messenger/messengerSlice'
import notificationReducer from '../features/notifications/notificationsSlice'

const rootReducer = combineReducers({
  posts: postsReducer,
  chats: messageReducer,
  notification: notificationReducer
});

export default rootReducer