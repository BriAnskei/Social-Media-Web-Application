// routes/userRouter.ts
import express, { Router } from "express";
import { login, register } from "../controllers/userController";
import upload from "../middleware/upload";

const userRouter: Router = express.Router();

userRouter.post("/register", upload.profile.single("profilePicture"), register);
userRouter.post("/login", login);

export default userRouter;
