import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { addUserMessage, addBotMessage, setMessages } from "@/features/chat/chatSlice";
import { getSocket } from "@/lib/socket";
import { useSocket } from "@/hooks/useSocket";

type ChatHistoryMessage = {
  sender: "user" | "bot" | "admin";
  message: string;
};

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const { messages } = useAppSelector((s) => s.chat);
  const { user } = useAppSelector((s) => s.auth);

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // 🔥 Initialize socket globally
  useSocket();

  useEffect(() => {
    const socket = getSocket();

    socket.on("reply", (data) => {
      dispatch(addBotMessage(data.message));
    });

    socket.on("admin_reply", (data) => {
      dispatch(addBotMessage(data.message));
    });

    socket.on("chat_history", (history: ChatHistoryMessage[]) => {
      dispatch(
        setMessages(
          history.map((msg) => ({
            sender: msg.sender === "user" ? "user" : "bot",
            message: msg.message,
          })),
        ),
      );
    });

    return () => {
      socket.off("reply");
      socket.off("admin_reply");
      socket.off("chat_history");
    };
  }, [dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !user?.id) return;

    const socket = getSocket();

    dispatch(addUserMessage(input));

    socket.emit("message", {
      userId: user.id,
      message: input,
    });

    setInput("");
  };

  return (
    <div className="flex flex-col h-[90vh] max-w-2xl mx-auto border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b font-semibold">Live Support Chat</div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs whitespace-pre-wrap ${
                msg.sender === "user" ? "bg-blue-500 text-white" : "bg-white border"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 border rounded px-3 py-2"
        />

        <button onClick={handleSend} className="bg-blue-500 text-white px-4 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
