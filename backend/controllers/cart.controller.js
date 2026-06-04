import {
  getCartByUserIdService,
  addToCartService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
} from "../services/cart.service.js";

import AppError from "../utils/AppError.js";

/**
 * ✅ 1. GET CART
 */
export const getCartController = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cart = await getCartByUserIdService(userId);

    return res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
};

/**
 * ✅ 2. ADD TO CART
 */
export const addToCartController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let { productId, qty } = req.body;

    productId = Number(productId);
    qty = qty !== undefined ? Number(qty) : 1;

    if (!productId || isNaN(productId)) {
      throw new AppError("Valid productId is required", 400);
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      throw new AppError("Quantity must be a positive integer", 400);
    }

    const item = await addToCartService(userId, productId, qty);

    return res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

/**
 * ✅ 3. UPDATE CART ITEM
 */
export const updateCartItemController = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let productId = Number(req.params.productId);
    let { qty } = req.body;

    qty = Number(qty);

    if (!productId || isNaN(productId)) {
      throw new AppError("Valid productId is required", 400);
    }

    if (isNaN(qty)) {
      throw new AppError("Quantity is required", 400);
    }

    const updated = await updateCartItemService(userId, productId, qty);

    return res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * ✅ 4. REMOVE ITEM
 */
export const removeCartItemController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.productId);

    if (!productId || isNaN(productId)) {
      throw new AppError("Valid productId is required", 400);
    }

    const removedId = await removeCartItemService(userId, productId);

    return res.status(200).json({ productId: removedId });
  } catch (err) {
    next(err);
  }
};

/**
 * ✅ 5. CLEAR CART
 */
export const clearCartController = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await clearCartService(userId);

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
