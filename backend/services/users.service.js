import AppError from "../utils/AppError.js";
import db from "../models/index.js";
import { col, fn } from "sequelize";

export const getAllUsersService = async () => {
  try {
    const users = await db.User.findAll({
      attributes: {
        include: [
          "id",
          "firstName",
          "lastName",
          "email",
          "role",
          [fn("DATE", col("createdAt")), "joined"],
        ],
      },
    });
    return users;
  } catch (err) {
    throw new AppError(
      err.message || "Failed to fetch users",
      err.statusCode || 500,
    );
  }
};

export const updateUserService = async (id, data) => {
  try {
    const user = await db.User.findByPk(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (data.email) {
      const existingUser = await db.User.findOne({
        where: { email: data.email },
      });
      // ❌ If email belongs to another user
      if (existingUser && existingUser.id !== id) {
        throw new AppError("Email already in use", 400);
      }
    }
    const res = await user.update(data);

    const updatedUser = res.toJSON();
    delete updatedUser.password;

    return updatedUser;
  } catch (err) {
    throw new AppError(
      err.message || "Failed to update user",
      err.statusCode || 500,
    );
  }
};
