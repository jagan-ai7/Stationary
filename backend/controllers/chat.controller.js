// controllers/chat.controller.js

import db from "../models/index.js";
import { processMessage } from "../services/chat.service.js";
import { getIO } from "../socket/socket.js";

const { Chat, ChatMessage, User } = db;

const formatMessage = (message) => ({
  id: message.id,
  sender: message.sender,
  message: message.message,
  createdAt: message.createdAt,
});

const formatChat = (chat) => ({
  id: chat.id,
  userId: chat.userId,
  status: chat.status,
  createdAt: chat.createdAt,
  updatedAt: chat.updatedAt,
  user: chat.User
    ? {
        id: chat.User.id,
        firstName: chat.User.firstName,
        lastName: chat.User.lastName,
        email: chat.User.email,
      }
    : null,
  latestMessage: chat.messages?.[0] ? formatMessage(chat.messages[0]) : null,
  messages: chat.messages?.map(formatMessage) || [],
});

/**
 * 📥 GET CHAT HISTORY
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.id; // from auth middleware

    const chat = await Chat.findOne({
      where: { userId },
      include: {
        model: ChatMessage,
        as: "messages",
        order: [["createdAt", "ASC"]],
      },
    });

    if (!chat) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      data: chat.messages,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 📤 SEND MESSAGE (HTTP fallback)
 */
export const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // 1️⃣ Find or create chat
    let chat = await Chat.findOne({ where: { userId } });

    if (!chat) {
      chat = await Chat.create({ userId });
    }

    // 2️⃣ Save user message
    await ChatMessage.create({
      chatId: chat.id,
      sender: "user",
      message,
    });

    // 3️⃣ Process message
    const reply = await processMessage(userId, message, chat.id);

    // 4️⃣ Save bot reply
    await ChatMessage.create({
      chatId: chat.id,
      sender: "bot",
      message: reply,
    });

    res.status(200).json({
      success: true,
      data: {
        reply,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminChats = async (req, res, next) => {
  try {
    const chats = await Chat.findAll({
      where: { status: "active" },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: ChatMessage,
          as: "messages",
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: chats.map(formatChat),
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findByPk(req.params.chatId, {
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: ChatMessage,
          as: "messages",
          order: [["createdAt", "ASC"]],
        },
      ],
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    res.status(200).json({
      success: true,
      data: formatChat(chat),
    });
  } catch (err) {
    next(err);
  }
};

export const sendAdminMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const chat = await Chat.findByPk(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const saved = await ChatMessage.create({
      chatId: chat.id,
      sender: "admin",
      message,
    });

    await chat.update({ status: "active" });

    const payload = formatMessage(saved);

    try {
      const io = getIO();
      io.to(`user_${chat.userId}`).emit("admin_reply", payload);
      io.to("admins").emit("admin_chat_updated", {
        chatId: chat.id,
        userId: chat.userId,
        latestMessage: payload,
      });
    } catch {
      // Socket may not be initialized in non-server contexts.
    }

    res.status(201).json({
      success: true,
      data: payload,
    });
  } catch (err) {
    next(err);
  }
};

export const closeAdminChat = async (req, res, next) => {
  try {
    const chat = await Chat.findByPk(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    await chat.update({ status: "closed" });

    res.status(200).json({
      success: true,
      data: {
        id: chat.id,
        status: chat.status,
      },
    });
  } catch (err) {
    next(err);
  }
};
