import api from "@/api/axios";

export interface ChatMessage {
  id?: number;
  sender: "user" | "bot";
  message: string;
  createdAt?: string;
}

export interface ChatResponse {
  chatId: number;
  status: string;
  messages: ChatMessage[];
}

// 🔹 Send message to AI
export const sendMessage = async (message: string) => {
  const res = await api.post("/chat", { message });
  return res.data.reply;
};

// 🔹 Get chat history
export const getChat = async (): Promise<ChatResponse> => {
  const res = await api.get("/chat");
  return res.data.chat;
};
