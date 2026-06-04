import express from "express";
import {
  createProductController,
  getAllProductsController,
  getProductsByIdController,
  updateProductController,
  deleteProductController,
} from "../controllers/product.controller.js";
import { uploadProductImage } from "../config/multer.js";
import { authMiddleware, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  uploadProductImage,
  authMiddleware,
  isAdmin,
  createProductController,
);
router.get("/", getAllProductsController);
router.get("/:id", getProductsByIdController);
router.put(
  "/:id",
  uploadProductImage,
  authMiddleware,
  isAdmin,
  updateProductController,
);
router.delete("/:id", authMiddleware, isAdmin, deleteProductController);
export default router;
