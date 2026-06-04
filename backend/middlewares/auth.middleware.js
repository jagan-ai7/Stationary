import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

// 🔐 Verify token
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new AppError("No token provided", 401, {
          silent: true,
        }),
      );
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      return next(new AppError("JWT secret not configured", 500));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token expired", 401));
    }

    if (err.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401));
    }

    return next(new AppError("Authentication failed", 401));
  }
};

// 🔥 Admin-only middleware
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Unauthorized", 401));
  }

  if (req.user.role !== "admin") {
    return next(new AppError("Access denied. Admin only", 403));
  }

  next();
};
