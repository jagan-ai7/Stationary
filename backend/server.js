import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http"; // ✅ IMPORTANT
import db from "./models/index.js";
import seedAdmin from "./seeders/adminSeeder.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import usersRoutes from "./routes/users.route.js";
import cartRoutes from "./routes/cart.route.js";
import orderRoutes from "./routes/order.route.js";
import notificationRoutes from "./routes/notification.route.js";
import chatRoutes from "./routes/chat.route.js";
import { initSocket } from "./socket/socket.js"; // ✅ IMPORT
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 3030;

// ✅ Create HTTP server
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);

// 🚀 Start server
const startServer = async () => {
  try {
    await db.sequelize.sync();
    console.log("Database & tables created!");

    await seedAdmin();

    // ✅ Initialize socket
    initSocket(server);

    // ✅ Use server.listen NOT app.listen
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
};

startServer();

// ❗ Error middleware MUST be last
app.use(errorMiddleware);
