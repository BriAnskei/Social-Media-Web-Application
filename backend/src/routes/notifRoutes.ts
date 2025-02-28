import express, { Router } from "express";
import { getNotification } from "../controllers/notifController";
import authMiddleware from "../middleware/auth";

const notifRouter: Router = express.Router();

// dont forget to put '/' be fore the endpoint
notifRouter.get("/get", authMiddleware, getNotification);

export default notifRouter;
