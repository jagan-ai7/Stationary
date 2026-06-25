import { chatWithAI, getChatService } from "../ai/chat.service.js";

export const chatController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;
    const reply = await chatWithAI({ message, userId });
    res.status(200).json({ success: true, reply });
  } catch (err) {
    next(err);
  }
};

export const getChatController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const chat = await getChatService({ userId });
    res.status(200).json({ success: true, chat });
  } catch (err) {
    next(err);
  }
};
