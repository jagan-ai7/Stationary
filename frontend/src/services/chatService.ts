// features/chat/chatService.ts

import api from "@/api/axios";

export interface ChatMessageDTO {
  id: number;
  sender: "user" | "bot" | "admin";
  message: string;
  createdAt?: string;
}

export interface AdminChatDTO {
  id: number;
  userId: number;
  status: "active" | "closed";
  createdAt?: string;
  updatedAt?: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  latestMessage: ChatMessageDTO | null;
  messages: ChatMessageDTO[];
}

export const getChatHistoryAPI = async () => {
  const res = await api.get("/chat");
  return res.data.data;
};

export const sendMessageAPI = async (message: string) => {
  const res = await api.post("/chat", { message });
  return res.data.data;
};

export const getAdminChatsAPI = async (): Promise<AdminChatDTO[]> => {
  const res = await api.get("/chat/admin");
  return res.data.data;
};

export const getAdminChatAPI = async (chatId: number): Promise<AdminChatDTO> => {
  const res = await api.get(`/chat/admin/${chatId}`);
  return res.data.data;
};

export const sendAdminMessageAPI = async (
  chatId: number,
  message: string,
): Promise<ChatMessageDTO> => {
  const res = await api.post(`/chat/admin/${chatId}/reply`, { message });
  return res.data.data;
};

export const closeAdminChatAPI = async (
  chatId: number,
): Promise<{ id: number; status: "closed" }> => {
  const res = await api.patch(`/chat/admin/${chatId}/close`);
  return res.data.data;
};
