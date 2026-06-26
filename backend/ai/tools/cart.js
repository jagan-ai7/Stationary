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

    const page = filters.page || 1;
    const limit = filters.limit || 5;
    const offset = (page - 1) * limit;

    // 🔥 STEP 2: fetch WITH count
    const result = await db.CartItem.findAndCountAll({
      where,
      limit,
      offset,
      distinct: true,
      col: "id",
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
            required: true,
          }),
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // 🔥 PAGINATION CALC
    const total = result.count;
    const totalPages = Math.ceil(total / limit);

    // 🔥 STEP 3: return structured response
    return {
      data: result.rows,
      cart: cart.toJSON(),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (err) {
    console.error("GET CART ERROR:", err);
    throw err;
  }
};
