// This file be be an axios helper to setUp the axios intercepter to have an acces to the store
// Error: ReferenceError: can't access lexical declaration before initialization

import { refreshToken } from "../features/auth/authSlice";
import { api } from "./api";
import { Store } from "@reduxjs/toolkit";

const setupIntercpetor = (store: Store) => {
  api.interceptors.response.use(
    // intercept all response, user(successCallback, errorCallback), successCallback: return reponse as is if no error, errorCallback:if reponse containse an errro
    (response) => response,
    async (error) => {
      const originalReq = error.config; // contains details of the original request that failed.
      if (error.response.status === 401 && !originalReq._retry) {
        // error.response.status === 401 → This checks if the error is due to an unauthorized request (typically, an expired token).
        // !originalRequest._retry → Prevents infinite loops by ensuring that the request is retried only once. first loop will true because it is undifined
        originalReq._retry = true; // Sets a custom _retry property to true so that we do not keep retrying infinitely.

        await store.dispatch<any>(refreshToken()); // Calls the refresh token
        const { accessToken } = store.getState().auth;

        if (accessToken) {
          originalReq.header = { accessToken };
          return api(originalReq); // repeat the same process again by sending the request with a new token
        }
      }
      return Promise.reject(error);
    }
  );
};

export { setupIntercpetor };
