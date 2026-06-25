import db from "../../models/index.js";
import { Op } from "sequelize";

export const getOrders = async (userId, filters = {}) => {
  try {
    const where = { userId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.minAmount || filters.maxAmount) {
      where.totalAmount = {};
      if (filters.minAmount) {
        where.totalAmount[Op.gte] = filters.minAmount;
      }
      if (filters.maxAmount) {
        where.totalAmount[Op.lte] = filters.maxAmount;
      }
    }

    if (filters.fromDate) {
      where.createdAt = { [Op.gte]: filters.fromDate };
    }

    // 🔥 STEP 1: get orderIds if product filter exists
    let orderIds = null;

    if (filters.productName) {
      const items = await db.OrderItem.findAll({
        include: [
          {
            model: db.Product,
            where: {
              name: {
                [Op.like]: `%${filters.productName}%`,
              },
            },
          },
        ],
        attributes: ["orderId"],
        raw: true,
      });

      orderIds = [...new Set(items.map((i) => i.orderId))];

      if (orderIds.length === 0) {
        return [];
      }

      where.id = orderIds;
    }

    // 🔥 STEP 2: fetch FULL orders
    return await db.Order.findAll({
      where,
      limit: filters.limit || 5,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: db.OrderItem,
          include: [db.Product],
        },
      ],
    });
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    throw err;
  }
};
