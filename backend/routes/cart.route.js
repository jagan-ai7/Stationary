import {
  getCartController,
  clearCartController,
  addToCartController,
  updateCartItemController,
  removeCartItemController,
} from "../controllers/cart.controller.js";
import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getCartController);
router.post("/", authMiddleware, addToCartController);
router.patch("/:productId", authMiddleware, updateCartItemController);
router.delete("/:productId", authMiddleware, removeCartItemController);
router.delete("/", authMiddleware, clearCartController);
export default router;
