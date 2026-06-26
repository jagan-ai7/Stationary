import api from "@/api/axios";

export interface AIReply {
  type: "searchProducts" | "getCart" | "getOrders" | "getCategories" | "text";
  message: string;

  data?: any[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  filters?: Record<string, any>;

  meta?: {
    empty: boolean;
  };

  cart?: any; // only for cart
}

export interface ChatMessage {
  id?: number;
  sender: "user" | "bot";
  message: string | AIReply;
  createdAt?: string;
}

export interface ChatResponse {
  chatId: number;
  status: string;
  messages: ChatMessage[];
}

// 🔹 Send message to AI
export const sendMessage = async (message: string): Promise<AIReply> => {
  const res = await api.post("/chat", { message });
  return res.data.reply;
};

// 🔹 Get chat history
export const getChat = async (): Promise<ChatResponse> => {
  const res = await api.get("/chat");
  return res.data.chat;
};
