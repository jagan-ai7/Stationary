import { Op } from "sequelize";
import db from "../models/index.js";
import { getAIResponse } from "./ai.service.js";

const { Order, OrderItem, Product, Cart, CartItem, Notification } = db;

const PRODUCT_STOP_WORDS = new Set([
  "a",
  "an",
  "any",
  "are",
  "available",
  "buy",
  "can",
  "do",
  "for",
  "have",
  "how",
  "in",
  "is",
  "left",
  "many",
  "me",
  "of",
  "please",
  "product",
  "products",
  "show",
  "stock",
  "the",
  "under",
  "you",
]);

const formatMoney = (amount) => `$${Number(amount || 0).toFixed(2)}`;

const getPlain = (instance) =>
  instance?.get ? instance.get({ plain: true }) : instance;

const extractOrderId = (text) => {
  const match = text.match(/(?:order\s*#?|#)(\d+)/i);
  return match ? Number(match[1]) : null;
};

const extractMaxPrice = (text) => {
  const match = text.match(/(?:under|below|less than)\s*\$?(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : null;
};

const extractProductTerms = (text) =>
  text
    .toLowerCase()
    .replace(/[#₹$.,!?]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !PRODUCT_STOP_WORDS.has(word));

const findProducts = async (message, limit = 5) => {
  const text = message.toLowerCase();
  const terms = extractProductTerms(text);
  const maxPrice = extractMaxPrice(text);
  const where = {};

  if (terms.length) {
    where[Op.or] = terms.flatMap((term) => [
      { name: { [Op.like]: `%${term}%` } },
      { category: { [Op.like]: `%${term}%` } },
      { description: { [Op.like]: `%${term}%` } },
    ]);
  }

  if (maxPrice) {
    where.price = { [Op.lte]: maxPrice };
  }

  return Product.findAll({
    where,
    limit,
    order: [["updatedAt", "DESC"]],
  });
};

const detectIntent = (message) => {
  const text = message.toLowerCase().trim();

  if (/^(hi|hello|hey|help|what can you do|greetings)\b/.test(text))
    return "GREETING";
  if (/(admin|agent|human|support|contact)/.test(text)) return "HUMAN_HANDOFF";
  if (/(checkout|payment|pay|delivery|shipping)/.test(text))
    return "CHECKOUT_HELP";
  if (/(cart|basket)/.test(text)) return "CART_SUMMARY";
  if (/(cancel).*(order)|order.*(cancel)/.test(text)) return "CANCEL_ORDER";
  if (extractOrderId(text)) return "ORDER_DETAILS";
  if (/(my orders|recent orders|latest order|order status|orders)/.test(text))
    return "ORDER_SUMMARY";
  if (/(stock|available|left|in stock)/.test(text)) return "STOCK_CHECK";
  if (/(show|product|products|buy|have|under|below|less than)/.test(text))
    return "PRODUCT_SEARCH";

  return "GENERAL";
};

const handleGreeting = () =>
  [
    "Hi! I can help with:",
    "• Order status and order details",
    "• Product search and stock checks",
    "• Cart totals and checkout help",
    "• Connecting you with an admin",
  ].join("\n");

const formatOrderItem = (item) => {
  const plain = getPlain(item);
  const productName = plain.Product?.name || "Unknown product";
  return `${productName} x${plain.quantity} (${formatMoney(plain.price)})`;
};

const getOrderInclude = () => [
  {
    model: OrderItem,
    include: [{ model: Product, attributes: ["name"] }],
  },
];

const handleOrderSummary = async (userId) => {
  const orders = await Order.findAll({
    where: { userId },
    include: getOrderInclude(),
    limit: 3,
    order: [["createdAt", "DESC"]],
  });

  if (!orders.length) return "You don't have any orders yet.";

  return [
    "Here are your recent orders:",
    ...orders.map((order) => {
      const plain = getPlain(order);
      return `• Order #${plain.id}: ${plain.status}, ${formatMoney(plain.totalAmount)}`;
    }),
  ].join("\n");
};

const handleOrderDetails = async (userId, message) => {
  const orderId = extractOrderId(message);

  if (!orderId) return handleOrderSummary(userId);

  const order = await Order.findOne({
    where: { id: orderId, userId },
    include: getOrderInclude(),
  });

  if (!order) return `I couldn't find order #${orderId} for your account.`;

  const plain = getPlain(order);
  const items = (plain.OrderItems || []).map(formatOrderItem);

  return [
    `Order #${plain.id} is ${plain.status}.`,
    `Total: ${formatMoney(plain.totalAmount)}`,
    items.length ? `Items: ${items.join(", ")}` : "Items: No items found.",
  ].join("\n");
};

const handleCancelOrder = async (userId, message) => {
  const orderId = extractOrderId(message);
  const where = orderId
    ? { id: orderId, userId }
    : { userId, status: "pending" };

  const order = await Order.findOne({
    where,
    order: [["createdAt", "DESC"]],
  });

  if (!order) {
    return orderId
      ? `I couldn't find order #${orderId} for your account.`
      : "No pending order found to cancel.";
  }

  if (order.status !== "pending") {
    return `Order #${order.id} is already ${order.status}, so it can't be cancelled here.`;
  }

  order.status = "cancelled";
  await order.save();

  return `Order #${order.id} has been cancelled successfully.`;
};

const handleProductSearch = async (message) => {
  const products = await findProducts(message);

  if (!products.length) return "No matching products are available right now.";

  return [
    "Here are a few matching products:",
    ...products.map((product) => {
      const plain = getPlain(product);
      return `• ${plain.name} - ${formatMoney(plain.price)} (${plain.stock} in stock)`;
    }),
  ].join("\n");
};

const handleStockCheck = async (message) => {
  const products = await findProducts(message, 3);

  if (!products.length)
    return "I couldn't find a matching product to check stock.";

  return products
    .map((product) => {
      const plain = getPlain(product);
      return `${plain.name}: ${plain.stock > 0 ? `${plain.stock} in stock` : "out of stock"}.`;
    })
    .join("\n");
};

const handleCartSummary = async (userId) => {
  const cart = await Cart.findOne({
    where: { userId },
    include: [
      {
        model: CartItem,
        as: "items",
        include: [{ model: Product, as: "product" }],
      },
    ],
  });

  if (!cart || !cart.items?.length) return "Your cart is empty.";

  const lines = cart.items.map((item) => {
    const product = getPlain(item.product);
    return `• ${product.name} x${item.quantity} - ${formatMoney(product.price * item.quantity)}`;
  });
  const total = cart.items.reduce((sum, item) => {
    const product = getPlain(item.product);
    return sum + Number(product.price) * item.quantity;
  }, 0);

  return ["Your cart contains:", ...lines, `Total: ${formatMoney(total)}`].join(
    "\n",
  );
};

const handleCheckoutHelp = () =>
  [
    "To checkout, open your cart and choose Checkout.",
    "Make sure your profile and delivery details are correct before placing the order.",
    "You can track order status from the Orders page after checkout.",
  ].join("\n");

const handleHumanHandoff = async (userId) => {
  await Notification.create({
    userId: null,
    audience: "admin",
    kind: "new_order",
    title: "Customer needs support",
    message: `User #${userId} requested admin help in chat.`,
    read: false,
  });

  return "I've notified an admin. You can continue writing here, and support will reply in this chat.";
};

export const processMessage = async (userId, message, chatId) => {
  try {
    const intent = detectIntent(message);

    if (intent === "GREETING") return handleGreeting();
    if (intent === "ORDER_SUMMARY") return await handleOrderSummary(userId);
    if (intent === "ORDER_DETAILS")
      return await handleOrderDetails(userId, message);
    if (intent === "CANCEL_ORDER")
      return await handleCancelOrder(userId, message);
    if (intent === "PRODUCT_SEARCH") return await handleProductSearch(message);
    if (intent === "STOCK_CHECK") return await handleStockCheck(message);
    if (intent === "CART_SUMMARY") return await handleCartSummary(userId);
    if (intent === "CHECKOUT_HELP") return handleCheckoutHelp();
    if (intent === "HUMAN_HANDOFF") return await handleHumanHandoff(userId);

    return await getAIResponse({
      chatId,
      message,
    });
  } catch (error) {
    console.error("Chat Service Error:", error.message);

    return "Something went wrong. Please try again.";
  }
};
