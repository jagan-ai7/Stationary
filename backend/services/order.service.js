import AppError from "../utils/AppError.js";
import db from "../models/index.js";

const { Order, OrderItem, Product, User } = db;

/**
 * Safe helper → handles Sequelize instance OR plain object
 */
const getPlain = (instance) =>
  instance?.get ? instance.get({ plain: true }) : instance;

/**
 * Format Order Item
 */
const formatOrderItem = (itemInstance) => {
  const item = getPlain(itemInstance);

  return {
    productId: Number(item.productId),
    name: item.Product?.name || "Unknown",
    qty: Number(item.quantity),
    price: Number(item.price),
  };
};

/**
 * Format Order
 */
const formatOrder = (orderInstance) => {
  const order = getPlain(orderInstance);
  const iso = new Date(order.createdAt).toISOString();
  return {
    id: Number(order.id),
    userId: Number(order.userId),

    userName: order.User
      ? `${order.User.firstName} ${order.User.lastName}`
      : "Unknown",

    date: iso.split("T")[0] + " " + iso.split("T")[1].slice(0, 8),

    status: order.status,

    total: Number(order.totalAmount),

    items: (order.OrderItems || []).map(formatOrderItem),
  };
};

/**
 * GET ALL ORDERS
 */
export const getAllOrderService = async () => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["id", "name", "price", "image"],
            },
          ],
        },
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return orders.map(formatOrder);
  } catch (err) {
    throw new AppError(
      err.message || "Failed to fetch orders",
      err.statusCode || 500,
    );
  }
};

/**
 * CREATE ORDER
 */
export const createOrderService = async (userId, data) => {
  const t = await db.sequelize.transaction();

  try {
    if (!data?.items || data.items.length === 0) {
      throw new AppError("Order items are required", 400);
    }

    // 🔥 1. Validate + Reduce stock FIRST
    for (const item of data.items) {
      const product = await Product.findByPk(item.productId, {
        transaction: t,
        lock: t.LOCK.UPDATE, // 🔒 prevents race condition
      });

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      if (product.stock < item.qty) {
        throw new AppError(
          `Only ${product.stock} items left for ${product.name}`,
          400,
        );
      }

      product.stock -= item.qty; // ✅ reduce stock
      await product.save({ transaction: t });
    }

    // 🔥 2. Create Order
    const order = await Order.create(
      {
        userId,
        status: data.status || "pending",
        totalAmount: data.total,
      },
      { transaction: t },
    );

    // 🔥 3. Create Order Items
    await OrderItem.bulkCreate(
      data.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.qty,
        price: item.price,
      })),
      { transaction: t },
    );

    await t.commit();

    // 🔥 4. Fetch full order
    const fullOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ["name"] }],
        },
        {
          model: User,
          attributes: ["firstName", "lastName"],
        },
      ],
    });

    return formatOrder(fullOrder);
  } catch (err) {
    await t.rollback();
    throw new AppError(
      err.message || "Failed to create order",
      err.statusCode || 500,
    );
  }
};

/**
 * UPDATE ORDER STATUS
 */
export const updateOrderStatusService = async (id, newStatus) => {
  const t = await db.sequelize.transaction();

  try {
    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // 🔥 Restore stock ONLY if cancelling a pending order
    if (newStatus === "cancelled") {
      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.productId, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        product.stock += item.quantity; // 🔄 restore
        await product.save({ transaction: t });
      }
    }

    order.status = newStatus;
    await order.save({ transaction: t });

    await t.commit();

    return {
      id: Number(order.id),
      status: order.status,
    };
  } catch (err) {
    await t.rollback();
    throw new AppError(
      err.message || "Failed to update order status",
      err.statusCode || 500,
    );
  }
};
