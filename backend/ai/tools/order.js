import db from "../../models/index.js";
import { Op } from "sequelize";

export const getOrders = async (userId, filters = {}) => {
  try {
    const where = { userId };

    if (filters.orderId) where.id = filters.orderId;

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
        return {
          orders: [],
          pagination: {
            total: 0,
            page: filters.page || 1,
            limit: filters.limit || 5,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      }

      where.id = orderIds;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 5;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.Order.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: db.OrderItem,
          include: [db.Product],
        },
      ],
    });

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
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    throw err;
  }
};
