import db from "../../models/index.js";
import { Op } from "sequelize";

export const searchProducts = async (filters = {}) => {
  let {
    query,
    minPrice,
    maxPrice,
    category,
    sortBy = "newest",
    inStock,
    page,
    limit,
  } = filters;

  // ✅ FIX: safe defaults
  page = Number(page) || 1;
  limit = Number(limit) || 5;

  const offset = (page - 1) * limit;

  const where = {};

  // 🔎 SEARCH
  if (query) {
    where[Op.or] = [
      { name: { [Op.like]: `%${query}%` } },
      { description: { [Op.like]: `%${query}%` } },
    ];
  }

  // 💰 PRICE
  if (minPrice != null || maxPrice != null) {
    where.price = {};
    if (minPrice != null) where.price[Op.gte] = minPrice;
    if (maxPrice != null) where.price[Op.lte] = maxPrice;
  }

  // 📦 CATEGORY
  if (category) {
    where.category = category;
  }

  // 📦 STOCK
  if (inStock === true) {
    where.stock = { [Op.gt]: 0 };
  }

  // 📊 SORT
  const orderMap = {
    price_low: ["price", "ASC"],
    price_high: ["price", "DESC"],
    newest: ["createdAt", "DESC"],
    oldest: ["createdAt", "ASC"],
    stock_high: ["stock", "DESC"],
    stock_low: ["stock", "ASC"],
  };

  const order = orderMap[sortBy] ? [orderMap[sortBy]] : [["createdAt", "DESC"]];

  const { count, rows } = await db.Product.findAndCountAll({
    where,
    order,
    limit,
    offset,
  });

  // ✅ FIX: full pagination object
  const totalPages = Math.ceil(count / limit);

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

export const getCategories = async () => {
  const rows = await db.Product.findAll({
    attributes: ["category"],
    group: ["category"],
    raw: true, // 🔥 IMPORTANT FIX
  });

  return rows.map((r) => r.category).filter((c) => c && c.trim() !== "");
};
