import {
  signupService,
  loginService,
  getUserByIdService,
} from "../services/auth.service.js";

export const signupController = async (req, res, next) => {
  try {
    const { user, token } = await signupService(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { user, token } = await loginService(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserByIdController = async (req, res, next) => {
  try {
    const id = req.user.id;
    const user = await getUserByIdService(id);
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};
