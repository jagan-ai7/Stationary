import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchChat, sendChatMessage } from "@/features/chat/chatSlice";

/* ================= TYPES ================= */

type Sender = "user" | "bot" | "admin";

interface ChatMessage {
  sender: Sender;
  message: string | ParsedMessage;
}

interface ParsedMessage {
  type: "text" | "searchProducts" | "getCart" | "getOrders" | "getCategories";
  message?: string;
  data?: any;
  meta?: {
    empty?: boolean;
    suggestions?: string[];
  };
}

interface OrderItem {
  id: number;
  quantity: number;
  Product: {
    id: number;
    name: string;
  };
}

interface Order {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  OrderItems: OrderItem[];
}

interface Cart {
  id: number;
  items: CartItem[];
}

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

/* ================= COMPONENT ================= */

const Chat = () => {
  const dispatch = useAppDispatch();
  const { messages, loading, error } = useAppSelector((state) => state.chat);

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch(fetchChat());
  }, [dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    dispatch(sendChatMessage(input));
    setInput("");
  };

  /* ================= SAFE PARSER ================= */

  const parseMessage = (message: unknown): ParsedMessage => {
    try {
      if (typeof message === "string") {
        return JSON.parse(message);
      }
      return message as ParsedMessage;
    } catch {
      return { type: "text", message: String(message) };
    }
  };

  /* ================= VIEWS ================= */

  const ProductsView = ({ data }: { data: any }) => {
    return (
      <div className="space-y-2">
        {data.products.map((p: any) => (
          <div key={p.id} className="border p-3 rounded bg-white text-black">
            <div className="font-bold">{p.name}</div>
            <div className="text-sm">${p.price}</div>
            <div className="text-sm">{p.category}</div>
            <div className="text-sm">Stock: {p.stock}</div>
          </div>
        ))}
      </div>
    );
  };

  const CartView = ({ data }: { data: Cart }) => {
    return (
      <div className="space-y-2">
        {data?.items?.map((item) => (
          <div key={item.id} className="border p-2 rounded bg-white text-black">
            <div>• Product: {item.product?.name}</div>
            <div>• Quantity: {item.quantity}</div>
            <div>• Total: ${item.product?.price * item.quantity}</div>
          </div>
        ))}
      </div>
    );
  };

  const OrdersView = ({ data }: { data: Order[] }) => {
    return (
      <div className="space-y-3">
        {data?.map((order) => (
          <div key={order.id} className="border p-3 rounded bg-white text-black">
            <div className="font-semibold">Order #{order.id}</div>
            <div>Date: {new Date(order.createdAt).toLocaleString()}</div>
            <div>Status: {order.status}</div>

            <div className="mt-2 text-sm">
              <div className="font-medium">Items:</div>

              {order.OrderItems?.map((item) => (
                <div key={item.id} className="ml-2">
                  • {item.Product?.name} × {item.quantity}
                </div>
              ))}
            </div>

            <div>Total: ${order.totalAmount}</div>
          </div>
        ))}
      </div>
    );
  };

  const CategoriesView = ({ data }: { data: string[] }) => {
    return (
      <div className="flex flex-wrap gap-2">
        {data.map((cat, i) => (
          <span key={i} className="bg-white px-2 py-1 rounded text-black border">
            {cat}
          </span>
        ))}
      </div>
    );
  };

  // const EmptyView = ({ message, suggestions }: { message?: string; suggestions?: string[] }) => (
  //   <div>
  //     <div>{message}</div>

  //     {suggestions?.length ? (
  //       <div className="mt-2 flex gap-2 flex-wrap">
  //         {suggestions.map((s, i) => (
  //           <button
  //             key={i}
  //             onClick={() => setInput(s)}
  //             className="text-xs bg-gray-300 px-2 py-1 rounded"
  //           >
  //             {s}
  //           </button>
  //         ))}
  //       </div>
  //     ) : null}
  //   </div>
  // );

  /* ================= UI ================= */

  return (
    <div className="flex flex-col h-full p-5">
      {/* ❌ FIXED ERROR RENDERING */}
      {error && <div className="text-red-500">{String(error)}</div>}

      {/* 💬 Messages */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((msg: ChatMessage, idx: number) => {
          const parsed = parseMessage(msg.message);
          const isBot = msg.sender !== "user";

          return (
            <div
              key={idx}
              className={`p-2 rounded w-fit max-w-[75%] ${
                isBot ? "bg-gray-200 text-black" : "bg-blue-500 text-white ml-auto"
              }`}
            >
              {/* USER */}
              {!isBot && <div>{String(parsed.message || msg.message)}</div>}

              {/* BOT */}

              {isBot && (
                <>
                  {/* ✅ ALWAYS show message ONCE */}
                  {parsed.message && <div className="mb-2">{parsed.message}</div>}

                  {/* ✅ ONLY render data when NOT empty */}
                  {!parsed.meta?.empty && parsed.type !== "text" && (
                    <>
                      {parsed.type === "searchProducts" && <ProductsView data={parsed.data} />}

                      {parsed.type === "getCart" && <CartView data={parsed.data} />}

                      {parsed.type === "getOrders" && <OrdersView data={parsed.data} />}

                      {parsed.type === "getCategories" && <CategoriesView data={parsed.data} />}
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* Loading */}
        {loading && <div className="text-gray-400 text-sm">Typing...</div>}

        <div ref={bottomRef} />
      </div>

      {/* 📝 Input */}
      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 border p-2 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          disabled={loading}
        />

        <button
          onClick={handleSend}
          className="bg-black text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
