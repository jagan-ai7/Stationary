import {
  getAllOrderService,
  createOrderService,
  updateOrderStatusService,
} from "../services/order.service.js";

export const getAllOrderController = async (req, res, next) => {
  try {
    const order = await getAllOrderService();
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const createOrderController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const order = await createOrderService(userId, req.body);
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatusController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ Basic validation
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const updated = await updateOrderStatusService(id, status);

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
