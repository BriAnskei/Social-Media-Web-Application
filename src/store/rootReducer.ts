import { combineReducers } from "@reduxjs/toolkit";
import postsReducer from '../features/posts/postSlice'

const rootReducer = combineReducers({
  posts: postsReducer,
});

export default rootReducer