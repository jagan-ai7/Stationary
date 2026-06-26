import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as chatService from "@/services/chatService";
import { AIReply, ChatResponse } from "@/services/chatService";

export interface Message {
  sender: "user" | "bot";
  message: string | AIReply;
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
};

export const fetchChat = createAsyncThunk<ChatResponse>("chat/fetchChat", async () => {
  return await chatService.getChat();
});

export const sendChatMessage = createAsyncThunk<AIReply, string>(
  "chat/sendMessage",
  async (message) => {
    return await chatService.sendMessage(message);
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearChat: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder

      // 🔹 FETCH CHAT
      .addCase(fetchChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchChat.fulfilled, (state, action) => {
        state.messages = (action.payload.messages || []).map((msg: any) => ({
          sender: msg.sender,
          message: msg.message,
        }));
        state.loading = false;
      })

      .addCase(fetchChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch chat";
      })

      // 🔹 SEND MESSAGE
      .addCase(sendChatMessage.pending, (state, action) => {
        state.loading = true;

        // ✅ Add user message HERE
        state.messages.push({
          sender: "user",
          message: action.meta.arg,
        });
      })

      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;

        // ✅ Only bot message here
        state.messages.push({
          sender: "bot",
          message: action.payload,
        });
      })

      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to send message";
      });
  },
});

export const { clearChat } = chatSlice.actions;
export default chatSlice.reducer;
