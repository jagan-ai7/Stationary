import {
  getAllUsersController,
  updateUserController,
} from "../controllers/users.controller.js";
import express from "express";
import { authMiddleware, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getAllUsersController);
router.put("/edit", authMiddleware, updateUserController);
export default router;
