import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { processMessage } from "../services/chat.service.js";
import db from "../models/index.js";

const { Chat, ChatMessage } = db;

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token || !process.env.JWT_SECRET) {
        return next(new Error("Unauthorized"));
      }

      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("⚡ User connected:", socket.id);

    // ✅ Join room
    socket.on("join", async () => {
      if (socket.user.role === "admin") {
        socket.join("admins");
        console.log("👤 Admin joined support room:", socket.user.id);
        return;
      }

      const userId = socket.user.id;
      console.log("👤 Joined room:", userId);
      socket.join(`user_${userId}`);

      // 🔥 Load chat history
      const chat = await Chat.findOne({
        where: { userId },
        include: {
          model: ChatMessage,
          as: "messages",
          limit: 20,
          order: [["createdAt", "ASC"]],
        },
      });

      if (chat) {
        socket.emit("chat_history", chat.messages);
      }
    });

    // ✅ Receive message
    socket.on("message", async ({ message }) => {
      try {
        const userId = socket.user.id;

        // 1️⃣ Find or create chat
        let chat = await Chat.findOne({ where: { userId } });

        if (!chat) {
          chat = await Chat.create({ userId });
        }

        // 2️⃣ Save user message
        const userMessage = await ChatMessage.create({
          chatId: chat.id,
          sender: "user",
          message,
        });

        io.to("admins").emit("admin_chat_updated", {
          chatId: chat.id,
          userId,
          latestMessage: userMessage,
        });

        // 3️⃣ Get AI reply
        const reply = await processMessage(userId, message, chat.id);

        // 4️⃣ Save bot reply
        const botMessage = await ChatMessage.create({
          chatId: chat.id,
          sender: "bot",
          message: reply,
        });

        // 5️⃣ Emit reply
        io.to(`user_${userId}`).emit("reply", {
          message: reply,
        });

        io.to("admins").emit("admin_chat_updated", {
          chatId: chat.id,
          userId,
          latestMessage: botMessage,
        });
      } catch (err) {
        console.error(err);

        socket.emit("reply", {
          message: "Something went wrong",
        });
      }
    });

    socket.on("admin_message", async ({ chatId, message }) => {
      try {
        if (socket.user.role !== "admin") return;
        if (!chatId || !message?.trim()) return;

        const chat = await Chat.findByPk(chatId);

        if (!chat) return;

        const saved = await ChatMessage.create({
          chatId: chat.id,
          sender: "admin",
          message,
        });

        await chat.update({ status: "active" });

        io.to(`user_${chat.userId}`).emit("admin_reply", {
          id: saved.id,
          sender: saved.sender,
          message: saved.message,
          createdAt: saved.createdAt,
        });

        io.to("admins").emit("admin_chat_updated", {
          chatId: chat.id,
          userId: chat.userId,
          latestMessage: saved,
        });
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};
