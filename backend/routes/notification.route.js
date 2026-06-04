import express from "express";
import {
  getNotificationsController,
  createNotificationController,
  markReadController,
  markAllReadController,
} from "../controllers/notification.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getNotificationsController);
router.post("/", authMiddleware, createNotificationController);
router.patch("/:id/read", authMiddleware, markReadController);
router.patch("/read-all", authMiddleware, markAllReadController);

export default router;
