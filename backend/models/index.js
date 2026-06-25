import { Sequelize, DataTypes } from "sequelize";
import UserModel from "./user.model.js";
import ProductModel from "./product.model.js";
import CartModel from "./cart.model.js";
import CartItemModel from "./cartItem.model.js";
import OrderModel from "./order.model.js";
import OrderItemModel from "./orderItem.model.js";
import NotificationModel from "./notification.model.js";
import ChatModel from "./chat.model.js";
import ChatMessageModel from "./chatMessage.model.js";
import { sequelize } from "../config/database.js";

// Initialize models
const db = {};

db.User = UserModel(sequelize, DataTypes);
db.Product = ProductModel(sequelize, DataTypes);
db.Cart = CartModel(sequelize, DataTypes);
db.CartItem = CartItemModel(sequelize, DataTypes);
db.Order = OrderModel(sequelize, DataTypes);
db.OrderItem = OrderItemModel(sequelize, DataTypes);
db.Notification = NotificationModel(sequelize, DataTypes);
db.Chat = ChatModel(sequelize, DataTypes);
db.ChatMessage = ChatMessageModel(sequelize, DataTypes);

// 🔥 ASSOCIATIONS

// User ↔ Cart
db.User.hasOne(db.Cart, { foreignKey: "userId", onDelete: "CASCADE" });
db.Cart.belongsTo(db.User, { foreignKey: "userId" });

// Cart ↔ CartItem
db.Cart.hasMany(db.CartItem, {
  foreignKey: "cartId",
  as: "items", // ✅ alias
  onDelete: "CASCADE",
});

db.CartItem.belongsTo(db.Cart, {
  foreignKey: "cartId",
});

// Product ↔ CartItem
db.Product.hasMany(db.CartItem, {
  foreignKey: "productId",
  onDelete: "CASCADE",
});
db.CartItem.belongsTo(db.Product, { as: "product", foreignKey: "productId" });

// User ↔ Order
db.User.hasMany(db.Order, { foreignKey: "userId", onDelete: "CASCADE" });
db.Order.belongsTo(db.User, { foreignKey: "userId" });

// Order ↔ OrderItem
db.Order.hasMany(db.OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
db.OrderItem.belongsTo(db.Order, { foreignKey: "orderId" });

// Product ↔ OrderItem
db.Product.hasMany(db.OrderItem, { foreignKey: "productId" });
db.OrderItem.belongsTo(db.Product, { foreignKey: "productId" });

// User ↔ Notification
db.User.hasMany(db.Notification, { foreignKey: "userId", onDelete: "CASCADE" });
db.Notification.belongsTo(db.User, { foreignKey: "userId" });

// User ↔ Chat
db.User.hasMany(db.Chat, { foreignKey: "userId", onDelete: "CASCADE" });
db.Chat.belongsTo(db.User, { foreignKey: "userId" });

// Chat ↔ ChatMessage
db.Chat.hasMany(db.ChatMessage, {
  foreignKey: "chatId",
  as: "messages",
  onDelete: "CASCADE",
});

db.ChatMessage.belongsTo(db.Chat, {
  foreignKey: "chatId",
  as: "chat", // add alias chat
});

// Export
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
