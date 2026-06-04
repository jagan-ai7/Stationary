import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  sender: "user" | "bot";
  message: string;
}

interface ChatState {
  messages: Message[];
  loading: boolean;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,

  // ✅ THIS is the correct place
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        sender: "user",
        message: action.payload,
      });
    },

    addBotMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        sender: "bot",
        message: action.payload,
      });
    },

    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },

    clearChat: (state) => {
      state.messages = [];
    },
  },
});

export const { addUserMessage, addBotMessage, setMessages, clearChat } = chatSlice.actions;

export default chatSlice.reducer;
