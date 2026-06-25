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

    // 5. EXECUTE TOOL
    let toolResult = null;

    switch (action.tool) {
      case "searchProducts": {
        const safeFilters = sanitizeProductFilters(action.args || {});
        const fallbackFilters = extractProductFallback(message);

        const finalFilters = {
          ...fallbackFilters,
          ...safeFilters,
        };

        toolResult = await searchProducts(finalFilters);
        break;
      }

      case "getCart": {
        const safeFilters = sanitizeCartFilters(action.args || {});
        const fallbackFilters = extractCartFallback(message);

        const finalFilters = {
          ...fallbackFilters,
          ...safeFilters,
        };

        toolResult = await getCart(userId, finalFilters);
        break;
      }

      case "getOrders": {
        const safeFilters = sanitizeOrderFilters(action.args || {});
        const fallbackFilters = extractOrderFallback(message);

        const finalFilters = {
          ...fallbackFilters,
          ...safeFilters,
        };

        toolResult = await getOrders(userId, finalFilters);
        console.log("Action: ", action.args);
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

      switch (tool) {
        case "searchProducts":
          return !result.products || result.products.length === 0;

        case "getCart":
          return !result.items || result.items.length === 0;

        case "getOrders":
          return !result.length;

        case "getCategories":
          return !result.length;

        default:
          return false;
      }
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

    // 6. BUILD FINAL RESPONSE (NO AI FOR DATA)
    let response;

    const isEmpty = isEmptyResult(action.tool, toolResult);

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
        data: toolResult || [],
        meta: {
          empty: isEmpty,
        },
      };
    } else {
      // fallback to AI chat
      const final = await clod.post("/chat/completions", {
        model: process.env.CLOD_MODEL,
        messages: [
          {
            role: "system",
            content: `
You are a helpful ecommerce assistant.
Give short and helpful replies.
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
      return "Here are your recent orders";
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
