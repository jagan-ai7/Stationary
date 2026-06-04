import {
  getAllOrderController,
  createOrderController,
  updateOrderStatusController,
} from "../controllers/order.controller.js";
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getAllOrderController);
router.post("/", authMiddleware, createOrderController);
router.patch("/:id/status", authMiddleware, updateOrderStatusController);

export default router;
