import {
  signupController,
  loginController,
  getUserByIdController,
} from "../controllers/auth.controller.js";
import express from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { signupSchema, loginSchema } from "../validations/auth.validation.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), signupController);
router.post("/login", validate(loginSchema), loginController);
router.get("/me", authMiddleware, getUserByIdController);

export default router;
