import express, { Router } from "express";
import { saveNotification } from "../controllers/notifController";

const notifRouter: Router = express.Router();

// // dont forget to put '/' be fore the endpoint
// notifRouter.post("/add", saveNotification);

export default notifRouter;
