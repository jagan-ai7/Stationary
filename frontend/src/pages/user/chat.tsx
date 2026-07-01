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
  pagination?: any;
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

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    description: string;
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
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    dispatch(sendChatMessage(input));
    setInput("");
  };

  /* ================= SAFE PARSER ================= */

  const parseMessage = (message: unknown): ParsedMessage => {
    if (typeof message === "string") {
      try {
        const parsed = JSON.parse(message);

        if (typeof parsed === "object" && parsed !== null && "type" in parsed) {
          return parsed as ParsedMessage;
        }

        return { type: "text", message };
      } catch {
        return { type: "text", message };
      }
    }

    return message as ParsedMessage;
  };

  /* ================= VIEWS ================= */

  const ProductsView = ({ data }: { data: any }) => {
    if (!Array.isArray(data)) {
      return <div className="dark:bg-[#1D293D] dark:text-white">No products found</div>;
    }

    return (
      <div className="space-y-2">
        {data.map((p: any) => (
          <div key={p.id} className="border p-3 rounded dark:text-white text-black">
            <div className="font-bold">{p.name}</div>
            <div className="text-sm">
              <span className="font-bold">Price: </span>${p.price}
            </div>
            <div className="text-sm">
              <span className="font-bold">Category: </span>
              {p.category}
            </div>
            <div className="text-sm">
              <span className="font-bold">Stock: </span>
              {p.stock}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const CartView = ({ data }: { data: CartItem[] }) => {
    if (!Array.isArray(data)) {
      return <div className=" dark:text-white">No cart items</div>;
    }

    return (
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.id} className="border p-3 rounded dark:text-white text-black">
            <div className="font-bold">{item.product?.name}</div>
            <div>
              <span className="font-bold">Description: </span>
              {item.product?.description}
            </div>
            <div>
              <span className="font-bold">Quantity: </span>
              {item.quantity}
            </div>
            <div>
              <span className="font-bold">Total: </span>${item.product?.price * item.quantity}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const OrdersView = ({ data }: { data: Order[] }) => {
    if (!Array.isArray(data)) {
      return <div className=" dark:text-white">No orders found</div>;
    }

    return (
      <div className="space-y-2">
        {data.map((order) => (
          <div key={order.id} className="border p-3 rounded text-black dark:text-white">
            <div className="font-bold">Order #{order.id}</div>
            <div>
              <span className="font-bold">Date: </span>
              {new Date(order.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-bold">Status: </span>
              {order.status}
            </div>

            <div className="mt-2 text-sm">
              <div className="font-medium">
                <span className="font-bold">Items: </span>
              </div>
              {order.OrderItems?.map((item) => (
                <div key={item.id} className="ml-2">
                  • {item.Product?.name} × {item.quantity}
                </div>
              ))}
            </div>

            <div>
              <span className="font-bold">Total: </span>${order.totalAmount}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const CategoriesView = ({ data }: { data: string[] }) => {
    if (!Array.isArray(data)) {
      return <div className="dark:text-white">No categories</div>;
    }

    return (
      <div className="flex flex-col gap-2 flex-wrap">
        {data.map((cat, i) => (
          <div key={i} className="bg-gray-200 px-2 py-1 rounded text-sm font-bold">
            • {cat}
          </div>
        ))}
      </div>
    );
  };

  /* ================= UI ================= */

  return (
    <div className="flex flex-col flex-1 p-5 min-h-0">
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
                isBot
                  ? "bg-gray-200 dark:bg-[#0F172B] text-black"
                  : "bg-blue-500 text-white ml-auto"
              }`}
            >
              {/* USER */}
              {!isBot && <div>{String(parsed.message || msg.message)}</div>}

              {/* BOT */}

              {isBot && (
                <>
                  {/* ✅ Message */}
                  {parsed.message && <div className="mb-2 dark:text-white">{parsed.message}</div>}

                  {/* ✅ Data */}
                  {!parsed.meta?.empty && parsed.type !== "text" && (
                    <>
                      {parsed.type === "searchProducts" && <ProductsView data={parsed.data} />}
                      {parsed.type === "getCart" && <CartView data={parsed.data} />}
                      {parsed.type === "getOrders" && <OrdersView data={parsed.data} />}
                      {parsed.type === "getCategories" && <CategoriesView data={parsed.data} />}
                    </>
                  )}

                  {/* ✅ Pagination Hints */}
                  {parsed.pagination && (
                    <div className="text-xs text-gray-500 mt-2">
                      {parsed.pagination.hasNext && (
                        <div>
                          👉 Type <b>next</b> to see more
                        </div>
                      )}

                      {parsed.pagination.hasPrev && (
                        <div>
                          👉 Type <b>back</b> to go to previous
                        </div>
                      )}
                    </div>
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
          className="bg-black text-white px-4 py-2 rounded dark:bg-[#1D293D]"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
