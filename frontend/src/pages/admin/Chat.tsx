// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { toast } from "sonner";
// import { getSocket } from "@/lib/socket";
// import { useSocket } from "@/hooks/useSocket";
// import {
//   closeAdminChatAPI,
//   getAdminChatAPI,
//   getAdminChatsAPI,
//   sendAdminMessageAPI,
//   type AdminChatDTO,
//   type ChatMessageDTO,
// } from "@/services/chatService";

// const getCustomerName = (chat: AdminChatDTO) =>
//   chat.user ? `${chat.user.firstName} ${chat.user.lastName}` : `User #${chat.userId}`;

// export default function AdminChat() {
//   const [chats, setChats] = useState<AdminChatDTO[]>([]);
//   const [selectedChat, setSelectedChat] = useState<AdminChatDTO | null>(null);
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const bottomRef = useRef<HTMLDivElement | null>(null);

//   useSocket();

//   const selectedChatId = selectedChat?.id;

//   const loadChats = useCallback(async () => {
//     const data = await getAdminChatsAPI();
//     setChats(data);
//   }, []);

//   const loadChat = useCallback(async (chatId: number) => {
//     const data = await getAdminChatAPI(chatId);
//     setSelectedChat(data);
//   }, []);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         setLoading(true);
//         await loadChats();
//       } catch {
//         toast.error("Failed to load chats");
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, [loadChats]);

//   useEffect(() => {
//     const socket = getSocket();

//     const handleUpdate = (data: { chatId: number }) => {
//       loadChats();
//       if (data.chatId === selectedChatId) {
//         loadChat(data.chatId);
//       }
//     };

//     socket.on("admin_chat_updated", handleUpdate);

//     return () => {
//       socket.off("admin_chat_updated", handleUpdate);
//     };
//   }, [loadChat, loadChats, selectedChatId]);

//   const sortedMessages = useMemo(() => selectedChat?.messages || [], [selectedChat]);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [sortedMessages]);

//   const handleSend = async () => {
//     if (!selectedChat || !message.trim()) return;

//     try {
//       setSending(true);
//       const saved = await sendAdminMessageAPI(selectedChat.id, message.trim());
//       setSelectedChat({
//         ...selectedChat,
//         messages: [...selectedChat.messages, saved],
//         latestMessage: saved,
//       });
//       setMessage("");
//       await loadChats();
//     } catch {
//       toast.error("Failed to send reply");
//     } finally {
//       setSending(false);
//     }
//   };

//   const handleClose = async () => {
//     if (!selectedChat) return;

//     try {
//       await closeAdminChatAPI(selectedChat.id);
//       setSelectedChat(null);
//       await loadChats();
//       toast.success("Chat closed");
//     } catch {
//       toast.error("Failed to close chat");
//     }
//   };

//   const renderMessage = (msg: ChatMessageDTO) => {
//     const isAdmin = msg.sender === "admin";
//     const isBot = msg.sender === "bot";

//     return (
//       <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
//         <div
//           className={`max-w-md rounded-lg px-4 py-2 text-sm ${
//             isAdmin
//               ? "bg-primary text-primary-foreground"
//               : isBot
//                 ? "border bg-muted"
//                 : "border bg-background"
//           }`}
//         >
//           <div className="mb-1 text-xs opacity-70">
//             {isAdmin ? "Admin" : isBot ? "Bot" : "User"}
//           </div>
//           <div className="whitespace-pre-wrap">{msg.message}</div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6 h-screen">
//       <h1 className="text-2xl font-semibold tracking-tight">Support Chat</h1>

//       <div className="grid min-h-[70vh] overflow-hidden rounded-xl border bg-card lg:grid-cols-[320px_1fr]">
//         <aside className="border-r">
//           <div className="border-b p-4 text-sm font-medium">Active chats</div>
//           {loading ? (
//             <div className="p-4 text-sm text-muted-foreground">Loading chats...</div>
//           ) : chats.length === 0 ? (
//             <div className="p-4 text-sm text-muted-foreground">No active chats.</div>
//           ) : (
//             <div className="divide-y">
//               {chats.map((chat) => (
//                 <button
//                   key={chat.id}
//                   onClick={() => loadChat(chat.id)}
//                   className={`block w-full p-4 text-left text-sm transition-colors hover:bg-accent ${
//                     selectedChat?.id === chat.id ? "bg-accent" : ""
//                   }`}
//                 >
//                   <div className="font-medium">{getCustomerName(chat)}</div>
//                   <div className="text-xs text-muted-foreground">{chat.user?.email}</div>
//                   <div className="mt-2 line-clamp-2 text-xs text-muted-foreground">
//                     {chat.latestMessage?.message || "No messages yet"}
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}
//         </aside>

//         <section className="flex min-h-[70vh] flex-col">
//           {selectedChat ? (
//             <>
//               <div className="flex items-center justify-between border-b p-4">
//                 <div>
//                   <div className="font-medium">{getCustomerName(selectedChat)}</div>
//                   <div className="text-xs text-muted-foreground">{selectedChat.user?.email}</div>
//                 </div>
//                 <button
//                   onClick={handleClose}
//                   className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
//                 >
//                   Close chat
//                 </button>
//               </div>

//               <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
//                 {sortedMessages.map(renderMessage)}
//                 <div ref={bottomRef} />
//               </div>

//               <div className="flex gap-2 border-t p-4">
//                 <input
//                   value={message}
//                   onChange={(event) => setMessage(event.target.value)}
//                   onKeyDown={(event) => {
//                     if (event.key === "Enter") {
//                       handleSend();
//                     }
//                   }}
//                   placeholder="Reply to customer..."
//                   className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
//                 />
//                 <button
//                   onClick={handleSend}
//                   disabled={sending || !message.trim()}
//                   className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
//                 >
//                   Send
//                 </button>
//               </div>
//             </>
//           ) : (
//             <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
//               Select a chat to reply.
//             </div>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// }
