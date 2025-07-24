import express, { Router } from "express";
import { getAllContacts } from "../controllers/contactController";
import authMiddleware from "../middleware/auth";
import {
  deleteConversation,
  findOne,
  findOrCreateConversation,
  getConversations,
} from "../controllers/convoController";
import upload from "../middleware/upload";
import { addMessage, getMessages } from "../controllers/messageController";

const messageRouter: Router = express.Router();

// contacts
messageRouter.post("/contact/get", authMiddleware, getAllContacts);

// conversation
messageRouter.post(
  "/conversation/find/:contactId",
  authMiddleware,
  findOrCreateConversation
);
messageRouter.post("/conversation/findOne", authMiddleware, findOne);
messageRouter.post("/conversation/get", authMiddleware, getConversations);
messageRouter.post("/conversation/drop", authMiddleware, deleteConversation);

// message

messageRouter.post(
  "/message/sent/:conversationId",
  authMiddleware,
  upload.message.single("image"),
  addMessage
);
messageRouter.post("/message/get/:conversationId", authMiddleware, getMessages);

export default messageRouter;
