import {
  getAllOrderController,
  createOrderController,
  updateOrderStatusController,
  getOrderByIdController,
} from "../controllers/order.controller.js";
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/all", authMiddleware, getAllOrderController);
router.get("/", authMiddleware, getOrderByIdController);
router.post("/", authMiddleware, createOrderController);
router.patch("/:id/status", authMiddleware, updateOrderStatusController);

export default router;
