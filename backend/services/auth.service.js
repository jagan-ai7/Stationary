import AppError from "../utils/AppError.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import generateToken from "../utils/jwt.js";
import db from "../models/index.js";

export const signupService = async (data) => {
  try {
    const existingUser = await db.User.findOne({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new AppError("User already exists", 400);
    }
    const { password, role, ...rest } = data;
    const hashedPassword = await hashPassword(password);
    const newUser = await db.User.create({
      ...rest,
      password: hashedPassword,
      role: "user",
    });
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      rode: newUser.role,
    });
    const userResponse = newUser.toJSON();
    delete userResponse.password;
    return { user: userResponse, token };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Failed to signup", 500);
  }
};

export const loginService = async (data) => {
  try {
    const user = await db.User.findOne({
      where: { email: data.email },
    });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }
    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    const userResponse = user.toJSON();
    delete userResponse.password;
    return { user: userResponse, token };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Failed to login", 500);
  }
};

export const getUserByIdService = async (id) => {
  try {
    const res = await db.User.findOne({ where: { id } });
    if (!res) {
      throw new AppError("User not found", 404);
    }
    const user = res.toJSON();
    delete user.password;
    return user;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Failed to get user", 500);
  }
};
