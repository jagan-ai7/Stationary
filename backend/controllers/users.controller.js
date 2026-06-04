import {
  getAllUsersService,
  updateUserService,
} from "../services/users.service.js";

export const getAllUsersController = async (req, res, next) => {
  try {
    const users = await getAllUsersService();
    res.status(200).json({
      status: "success",
      message: "Users fetched successfully",
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserController = async (req, res, next) => {
  try {
    const id = req.user.id;
    const updatedUser = await updateUserService(id, req.body);
    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};
