import express from "express";
import {
  chatController,
  getChatController,
} from "../controllers/chat.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, chatController);
router.get("/", authMiddleware, getChatController);

export default router;
