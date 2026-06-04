import { Op } from "sequelize";
import db from "../models/index.js";
import AppError from "../utils/AppError.js";

const { Notification, User } = db;

// ✅ CREATE
export const createNotificationService = async (data) => {
  try {
    const { userId, audience, kind, title, message } = data;

    if (!userId && !audience) {
      throw new AppError("userId or audience is required", 400);
    }

    const notification = await Notification.create({
      userId: userId || null,
      audience: audience || null,
      kind,
      title,
      message,
      read: false,
    });

    return notification;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      `Failed to create notification: ${err?.message || String(err)}`,
      500,
    );
  }
};

// ✅ GET ALL (with optional user info)
export const getAllNotificationsService = async (userId, role, audience) => {
  try {
    const where = {
      [Op.or]: [
        { userId }, // personal
        { audience: role }, // broadcast
      ],
    };

    // optional filter (frontend sends this sometimes)
    if (audience) {
      where.audience = audience;
    }

    const notifications = await Notification.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "email"],
          required: false, // IMPORTANT (because userId can be null)
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return notifications;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      `Failed to fetch notifications: ${err?.message || String(err)}`,
      500,
    );
  }
};

// ✅ MARK ONE AS READ
export const markReadService = async (id, currentUserId) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id,
        [Op.or]: [
          { userId: currentUserId }, // own
          { userId: null }, // broadcast
        ],
      },
    });

    if (!notification) {
      throw new AppError("Notification not found or not allowed", 404);
    }

    notification.read = true;
    await notification.save();

    return notification.id;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      `Failed to mark notification as read: ${err?.message || String(err)}`,
      500,
    );
  }
};

// ✅ MARK ALL AS READ
export const markAllReadService = async (currentUserId, role, audience) => {
  try {
    const where = {
      [Op.or]: [{ userId: currentUserId }, { audience: role }],
    };

    if (audience) {
      where.audience = audience;
    }

    await Notification.update({ read: true }, { where });

    return audience || role;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      `Failed to mark notifications as read: ${err?.message || String(err)}`,
      500,
    );
  }
};

// ✅ DELETE (optional but useful)
export const deleteNotificationService = async (id, currentUserId) => {
  try {
    const deleted = await Notification.destroy({
      where: {
        id,
        userId: currentUserId, // only own notifications
      },
    });

    if (!deleted) {
      throw new AppError("Notification not found or not allowed", 404);
    }

    return true;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      `Failed to delete notification: ${err?.message || String(err)}`,
      500,
    );
  }
};
