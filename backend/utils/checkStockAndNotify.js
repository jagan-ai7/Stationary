import db from "../models/index.js";

const { Notification } = db;

export const checkStockAndNotify = async (product) => {
  // Out of stock
  if (product.stock === 0) {
    await Notification.create({
      audience: "admin",
      kind: "out_of_stock",
      title: "Out of Stock",
      message: `${product.name} is out of stock.`,
      read: false,
    });

    return;
  }

  // Low stock
  if (product.stock > 0 && product.stock < 5) {
    await Notification.create({
      audience: "admin",
      kind: "low_stock",
      title: "Low Stock",
      message: `${product.name} has only ${product.stock} item(s) remaining.`,
      read: false,
    });
  }
};
