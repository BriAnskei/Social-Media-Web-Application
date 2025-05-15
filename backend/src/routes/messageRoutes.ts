import express, { Router } from "express";
import {
  findOrCreate,
  getAllContacts,
  updateOrRemove,
} from "../controllers/contactController";
import authMiddleware from "../middleware/auth";
import {
  deleteConversation,
  findOrCreateConvo,
  getConversations,
} from "../controllers/convoController";
import upload from "../middleware/upload";
import { addMessage, getMessages } from "../controllers/messageController";

const messageRouter: Router = express.Router();

// contacts
messageRouter.post("/contact/add", authMiddleware, findOrCreate);
messageRouter.post("/contact/get", authMiddleware, getAllContacts);
messageRouter.post("/contact/drop/:userId/:contactId", updateOrRemove);

// conversation
messageRouter.post(
  "/conversation/find/:contactId",
  authMiddleware,
  findOrCreateConvo
);
messageRouter.post("/conversation/get", authMiddleware, getConversations);
messageRouter.post("/conversation/drop", authMiddleware, deleteConversation);

// message
messageRouter.post(
  "/message/sent",
  authMiddleware,
  upload.post.save.single("image"),
  addMessage
);
messageRouter.post("/message/get/:conversationId", authMiddleware, getMessages);

export default messageRouter;
