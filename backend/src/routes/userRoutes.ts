// routes/userRouter.ts
import express, { Router } from "express";
import {
  fetchCurrentUser,
  fetchAllUsers,
  login,
  register,
  updateProfile,
  authorization,
} from "../controllers/userController";
import upload from "../middleware/upload";
import authMiddleware from "../middleware/auth";

const userRouter: Router = express.Router();

userRouter.post("/register", upload.profile.single("profilePicture"), register);
userRouter.post("/login", login);
userRouter.get("/me", authMiddleware, fetchCurrentUser);
userRouter.get("/users", authMiddleware, fetchAllUsers);
userRouter.put(
  "/update",
  authMiddleware,
  upload.profile.single("profilePicture"),
  updateProfile
);
userRouter.get("/authentication", authMiddleware, authorization);

export default userRouter;
