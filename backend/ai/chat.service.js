import db from "../models/index.js";
import { clod } from "./clod.client.js";
import { searchProducts, getCategories } from "./tools/product.js";
import { getCart } from "./tools/cart.js";
import { getOrders } from "./tools/order.js";
import {
  sanitizeOrderFilters,
  extractOrderFallback,
} from "./tools/orderFilters.js";
import {
  sanitizeProductFilters,
  extractProductFallback,
} from "./tools/productFilter.js";
import {
  sanitizeCartFilters,
  extractCartFallback,
} from "./tools/cartFilters.js";
import AppError from "../utils/AppError.js";

const { Chat, ChatMessage } = db;

export const chatWithAI = async ({ message, userId }) => {
  try {
    // 1. FIND OR CREATE CHAT
    let chat = await Chat.findOne({
      where: { userId, status: "active" },
    });

    if (!chat) {
      chat = await Chat.create({ userId, status: "active" });
    }

    // SAVE USER MESSAGE
    await ChatMessage.create({
      chatId: chat.id,
      sender: "user",
      message,
    });

    // 2. GET CATEGORIES (for AI context)
    const categories = (await getCategories()).filter(Boolean);
    const categoriesText = categories.join(", ");

    // 3. ROUTER AI (decides what to do)
    let action;

    try {
      const decision = await clod.post("/chat/completions", {
        model: process.env.CLOD_MODEL,
        messages: [
          {
            role: "system",
            content: `
You are an ecommerce intent router.

Categories:
${categoriesText}

Return ONLY JSON:
{
  "tool": "searchProducts|getCart|getOrders|getCategories|null",
  "args": {
    "query": "",
    "maxPrice": null,
    "minPrice": null,
    "category": null,
    "sortBy": null,
    "inStock": null,
    "page": 1,
    "limit": 5,

    "orderId": null,
    "status": null,
    "productName": null,
    "fromDate": null

    "minQty": null,
    "maxQty": null,
  }
}

RULES:
- "show products" => query = ""
- "cheapest" => sortBy = "price_low"
- "expensive" => sortBy = "price_high"
- "under X" => maxPrice = X
- "above X" => minPrice = X
- category must match exactly from list
- "cancelled orders" => status = "cancelled"
- "pending orders" => status = "pending"
- "completed orders" => status = "delivered"
- "shipped orders" => status = "shipped"
- "orders with X" => productName = X
- "orders above X" => minAmount = X
- NEVER return text
`,
          },
          { role: "user", content: message },
        ],
      });

      action = JSON.parse(decision.data.choices[0].message.content);
    } catch (err) {
      // fallback if AI fails
      action = { tool: null, args: {} };
    }

    const lastBotMessage = await ChatMessage.findOne({
      where: { chatId: chat.id, sender: "bot" },
      order: [["createdAt", "DESC"]],
    });

    let lastState = null;

    if (lastBotMessage) {
      try {
        const parsed = JSON.parse(lastBotMessage.message);

        if (parsed.type && parsed.pagination) {
          lastState = parsed;
        }
      } catch {}
    }

    const isPrev = /\b(previous|back)\b/i.test(message);
    const isNext = /\b(more|next|show more|load more)\b/i.test(message);

    if ((isNext || isPrev) && lastState) {
      action.tool = lastState.type;

      const currentPage = lastState.pagination?.page || 1;

      action.args = {
        ...(lastState.filters || {}),
        ...(action.args || {}), // AI overrides allowed
        page: isNext ? currentPage + 1 : Math.max(1, currentPage - 1),
        limit: lastState.pagination?.limit || 5,
      };
    }

    // 5. EXECUTE TOOL
    let toolResult = null;
    let finalFilters = {};
    let mergedFilters = {};

    switch (action.tool) {
      case "searchProducts": {
        const safeFilters = sanitizeProductFilters(action.args || {});
        const fallbackFilters =
          isNext || isPrev
            ? {} // 🔥 DO NOT APPLY FALLBACK FOR PAGINATION
            : extractProductFallback(message);

        mergedFilters = {
          ...fallbackFilters,
          ...safeFilters,
        };
        finalFilters = mergedFilters;

        toolResult = await searchProducts(mergedFilters);
        break;
      }

      case "getCart": {
        const safeFilters = sanitizeCartFilters(action.args || {});
        const fallbackFilters =
          isNext || isPrev ? {} : extractCartFallback(message);

        mergedFilters = {
          ...fallbackFilters,
          ...safeFilters,
        };
        finalFilters = mergedFilters;

        toolResult = await getCart(userId, mergedFilters);
        break;
      }

      case "getOrders": {
        const safeFilters = sanitizeOrderFilters(action.args || {});
        const fallbackFilters =
          isNext || isPrev ? {} : extractOrderFallback(message);

        mergedFilters = {
          ...fallbackFilters,
          ...safeFilters,
        };
        finalFilters = mergedFilters;

        toolResult = await getOrders(userId, mergedFilters);
        break;
      }

      case "getCategories":
        toolResult = await getCategories();
        break;

      default:
        toolResult = null;
    }

    const isEmptyResult = (tool, result) => {
      if (!result) return true;

      if (tool === "getCategories") {
        return !result.length;
      }

      return !result.data || result.data.length === 0;
    };

    const getEmptyMessage = (tool) => {
      switch (tool) {
        case "searchProducts":
          return "No products found";
        case "getCart":
          return "Your cart is empty";
        case "getOrders":
          return "You have no orders yet";
        case "getCategories":
          return "No categories available";
        default:
          return "Nothing found";
      }
    };

    const getToolData = (tool, result) => {
      if (tool === "getCategories") return result;

      return result.data || [];
    };

    // 6. BUILD FINAL RESPONSE (NO AI FOR DATA)
    let response;

    const isEmpty = isEmptyResult(action.tool, toolResult || {});

    if (
      ["searchProducts", "getCart", "getOrders", "getCategories"].includes(
        action.tool,
      )
    ) {
      response = {
        type: action.tool,
        message: isEmpty
          ? getEmptyMessage(action.tool)
          : getFriendlyMessage(action.tool),

        data: getToolData(action.tool, toolResult),
        pagination: toolResult?.pagination || null,
        filters: finalFilters,
        meta: {
          empty: isEmpty,
        },

        ...(action.tool === "getCart" && {
          cart: toolResult.cart,
        }),
      };
    } else {
      // fallback to AI chat
      const final = await clod.post("/chat/completions", {
        model: process.env.CLOD_MODEL,
        messages: [
          {
            role: "system",
            content: `
You are an AI assistant for a stationery ecommerce store.

AVAILABLE CATEGORIES:
${categoriesText}

STRICT RULES:
- You can ONLY use categories from the list above
- DO NOT create new categories
- DO NOT suggest anything outside these categories
- If user asks for products, map their intent to ONE of the categories
- If unclear, return "getCategories"
- ONLY talk about products IF they are explicitly provided in system context- You can ONLY use categories from the list above
- DO NOT create new categories
- DO NOT suggest anything outside these categories
- If user asks for products, map their intent to ONE of the categories
- If unclear, return "getCategories"
- DO NOT invent products
- If user asks something unrelated, respond conversationally (like a human assistant)
- If user asks about products but no data is available, say:
  "I can show you available products if you tell me what you're looking for."

- Keep replies short and natural
`,
          },
          { role: "user", content: message },
        ],
      });

      response = {
        type: "text",
        message: final.data.choices[0].message.content,
      };
    }

    // console.log("Message: ", message);
    // console.log("isNext: ", isNext);
    // console.log("Last State: ", lastState);

    // 7. SAVE BOT RESPONSE
    await ChatMessage.create({
      chatId: chat.id,
      sender: "bot",
      message: JSON.stringify(response),
    });

    return response;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to process AI chat request", 500);
  }
};

// ✅ Friendly UI messages
const getFriendlyMessage = (tool) => {
  switch (tool) {
    case "searchProducts":
      return "Here are some products for you";
    case "getCart":
      return "Here is your cart";
    case "getOrders":
      return "Here are your orders";
    case "getCategories":
      return "Available categories";
    default:
      return "";
  }
};

// ✅ FETCH CHAT
export const getChatService = async ({ userId }) => {
  try {
    const chat = await Chat.findOne({
      where: { userId, status: "active" },
    });

    if (!chat) {
      return {
        chatId: null,
        status: "inactive",
        messages: [],
      };
    }

    const messages = await ChatMessage.findAll({
      where: { chatId: chat.id },
      order: [["createdAt", "ASC"]],
    });

    // parse bot messages
    const formattedMessages = messages.map((msg) => {
      if (msg.sender === "bot") {
        try {
          return {
            ...msg.toJSON(),
            message: JSON.parse(msg.message),
          };
        } catch {
          return msg;
        }
      }
      return msg;
    });

    return {
      chatId: chat.id,
      status: chat.status,
      messages: formattedMessages,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to fetch chat", 500);
  }
};
