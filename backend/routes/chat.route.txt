// routes/chat.route.js

import express from "express";
import {
  closeAdminChat,
  getAdminChatById,
  getAdminChats,
  getChatHistory,
  sendAdminMessage,
  sendMessage,
} from "../controllers/chat.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 🔐 Protected routes
router.get("/admin", authMiddleware, isAdmin, getAdminChats);
router.get("/admin/:chatId", authMiddleware, isAdmin, getAdminChatById);
router.post("/admin/:chatId/reply", authMiddleware, isAdmin, sendAdminMessage);
router.patch("/admin/:chatId/close", authMiddleware, isAdmin, closeAdminChat);
router.get("/", authMiddleware, getChatHistory);
router.post("/", authMiddleware, sendMessage);

export default router;
