import express, { Router } from "express";
import {
  deleteNotifs,
  getNotification,
  setReadNotification,
} from "../controllers/notifController";
import authMiddleware from "../middleware/auth";

const notifRouter: Router = express.Router();

// dont forget to put '/' before the endpoint
notifRouter.get("/get", authMiddleware, getNotification);
notifRouter.post("/set-read", authMiddleware, setReadNotification);
notifRouter.post("/delete-notif", authMiddleware, deleteNotifs);

export default notifRouter;
