import express, { Router } from "express";
import {
  createContact,
  getAllContacts,
  removeContact,
} from "../controllers/contactController";
import authMiddleware from "../middleware/auth";

const messageRouter: Router = express.Router();

// contacts
messageRouter.post("/contact/add", authMiddleware, createContact);
messageRouter.post("/contact/get", authMiddleware, getAllContacts);

messageRouter.post("/contact/drop/:userId/:contactId", removeContact);

// conversation

// message

export default messageRouter;
