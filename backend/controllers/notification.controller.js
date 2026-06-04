import {
  createNotificationService,
  getAllNotificationsService,
  markAllReadService,
  markReadService,
} from "../services/notification.service.js";

// ✅ GET /notifications
export const getNotificationsController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { audience } = req.query;

    const notifications = await getAllNotificationsService(
      userId,
      role,
      audience,
    );

    res.status(200).json(notifications);
  } catch (err) {
    next(err);
  }
};

// ✅ POST /notifications
export const createNotificationController = async (req, res, next) => {
  try {
    const notification = await createNotificationService(req.body);
    res.status(201).json(notification);
  } catch (err) {
    next(err);
  }
};

// ✅ PATCH /notifications/:id/read
export const markReadController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    const result = await markReadService(id, userId);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// ✅ PATCH /notifications/read-all
export const markAllReadController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { audience } = req.body;

    const result = await markAllReadService(userId, role, audience);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
