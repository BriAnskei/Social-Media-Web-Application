import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// allows us to build funtion with multiple custome logic
export type AppThunk = ThunkAction<void, RootState, unknown, Action>;
// void → The thunk function doesn't return anything.
// RootState → The state type of your Redux store.
// unknown → This is for extra arguments (you usually don't need to specify anything here).
// AnyAction → Represents any Redux action that this thunk might dispatch.

export default store;
