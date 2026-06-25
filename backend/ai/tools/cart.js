import db from "../../models/index.js";
import { Op } from "sequelize";

export const getCart = async (userId, filters = {}) => {
  try {
    // 🔥 STEP 1: find cart
    const cart = await db.Cart.findOne({
      where: { userId },
    });

    if (!cart) return null;

    const where = {
      cartId: cart.id,
    };

    // ✅ QTY FILTER (DB level)
    if (filters.minQty || filters.maxQty) {
      where.quantity = {};

      if (filters.minQty) {
        where.quantity[Op.gte] = filters.minQty;
      }

      if (filters.maxQty) {
        where.quantity[Op.lte] = filters.maxQty;
      }
    }

    // 🔥 STEP 2: fetch filtered cart items
    const items = await db.CartItem.findAll({
      where,
      limit: filters.limit || 10,
      include: [
        {
          model: db.Product,
          as: "product",
          ...(filters.productName && {
            where: {
              name: {
                [Op.like]: `%${filters.productName}%`,
              },
            },
          }),
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // 🔥 STEP 3: return full cart with filtered items
    return {
      ...cart.toJSON(),
      items,
    };
  } catch (err) {
    console.error("GET CART ERROR:", err);
    throw err;
  }
};
