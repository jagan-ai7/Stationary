import { Op } from "sequelize";
import db from "../models/index.js";
import AppError from "../utils/AppError.js";

const { Notification, User } = db;

// ✅ CREATE
export const createNotificationService = async (userId, data) => {
  try {
    const { audience, kind, title, message } = data;

    // Either userId or audience must exist
    if (!userId && !audience) {
      throw new AppError("Either userId or audience is required.", 400);
    }

    const notification = await Notification.create({
      userId: userId ?? null,
      audience: audience ?? null,
      kind,
      title,
      message,
      read: false,
    });

    return notification;
  } catch (err) {
    if (err instanceof AppError) throw err;

    throw new AppError(`Failed to create notification: ${err.message}`, 500);
  }
};

// ✅ GET ALL (with optional user info)
export const getAllNotificationsService = async (userId, role) => {
  try {
    let where = {};

    if (role === "admin") {
      where = {
        [Op.or]: [{ userId }, { audience: "admin" }],
      };
    } else {
      where = {
        userId,
      };
    }

    const notifications = await Notification.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "email"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return notifications;
  } catch (err) {
    if (err instanceof AppError) throw err;

    throw new AppError(`Failed to fetch notifications: ${err.message}`, 500);
  }
};

// ✅ MARK ONE AS READ
export const markReadService = async (id, currentUserId, role) => {
  try {
    let where = {
      id,
    };

    if (role === "admin") {
      where[Op.or] = [{ userId: currentUserId }, { audience: "admin" }];
    } else {
      where.userId = currentUserId;
    }

    const notification = await Notification.findOne({
      where,
    });

    if (!notification) {
      throw new AppError("Notification not found.", 404);
    }

    notification.read = true;
    await notification.save();

    return notification;
  } catch (err) {
    if (err instanceof AppError) throw err;

    throw new AppError(
      `Failed to mark notification as read: ${err.message}`,
      500,
    );
  }
};

// ✅ MARK ALL AS READ
export const markAllReadService = async (currentUserId, role) => {
  try {
    let where = {};

    if (role === "admin") {
      where = {
        [Op.or]: [{ userId: currentUserId }, { audience: "admin" }],
      };
    } else {
      where = {
        userId: currentUserId,
      };
    }

    await Notification.update(
      {
        read: true,
      },
      {
        where,
      },
    );

    return true;
  } catch (err) {
    if (err instanceof AppError) throw err;

    throw new AppError(
      `Failed to mark all notifications as read: ${err.message}`,
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
        userId: currentUserId,
      },
    });

    if (!deleted) {
      throw new AppError("Notification not found.", 404);
    }

    return true;
  } catch (err) {
    if (err instanceof AppError) throw err;

    throw new AppError(`Failed to delete notification: ${err.message}`, 500);
  }
};
