import db from "../models/index.js";
import AppError from "../utils/AppError.js";

const { Cart, CartItem, Product } = db;

/**
 * Helper → format product safely
 */
const formatProduct = (productInstance) => {
  const product = productInstance.get({ plain: true });

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    price: Number(product.price), // ✅ fix DECIMAL issue
    stock: product.stock,
    image: product.image,
  };
};

/**
 * Get Cart by User ID
 */
export const getCartByUserIdService = async (userId) => {
  try {
    let cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
      ],
    });

    if (!cart) {
      await Cart.create({ userId });
      return [];
    }

    return (cart.items || []).map((item) => ({
      product: formatProduct(item.product),
      qty: item.quantity,
    }));
  } catch (err) {
    console.error("Cart error:", err);
    throw new AppError("Failed to fetch cart", 500);
  }
};

/**
 * Add item to cart
 */
export const addToCartService = async (userId, productId, qty = 1) => {
  try {
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new AppError("Quantity must be a positive integer", 400);
    }

    const productInstance = await Product.findByPk(productId);
    if (!productInstance) throw new AppError("Product not found", 404);

    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    const existingQty = cartItem ? cartItem.quantity : 0;
    const newQty = existingQty + qty;

    if (productInstance.stock < newQty) {
      throw new AppError("Not enough stock", 400);
    }

    if (cartItem) {
      cartItem.quantity = newQty;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity: qty,
      });
    }

    return {
      product: formatProduct(productInstance), // ✅ cleaned + numeric price
      qty: cartItem.quantity,
    };
  } catch (err) {
    throw new AppError(err.message || "Failed to add to cart", 500);
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItemService = async (userId, productId, qty) => {
  try {
    if (!Number.isInteger(qty)) {
      throw new AppError("Quantity must be an integer", 400);
    }

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) throw new AppError("Cart not found", 404);

    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (!cartItem) throw new AppError("Item not found in cart", 404);

    // ✅ Remove item if qty <= 0
    if (qty <= 0) {
      await cartItem.destroy();
      return { productId, qty: 0 };
    }

    // ✅ Check stock before updating
    const productInstance = await Product.findByPk(productId);
    if (!productInstance) throw new AppError("Product not found", 404);

    if (productInstance.stock < qty) {
      throw new AppError("Not enough stock", 400);
    }

    cartItem.quantity = qty;
    await cartItem.save();

    return { productId, qty };
  } catch (err) {
    throw new AppError(err.message || "Failed to update cart", 500);
  }
};

/**
 * Remove item from cart
 */
export const removeCartItemService = async (userId, productId) => {
  try {
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) throw new AppError("Cart not found", 404);

    await CartItem.destroy({
      where: { cartId: cart.id, productId },
    });

    return productId;
  } catch (err) {
    throw new AppError(err.message || "Failed to remove item", 500);
  }
};

/**
 * Clear entire cart
 */
export const clearCartService = async (userId) => {
  try {
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) return;

    await CartItem.destroy({
      where: { cartId: cart.id },
    });
  } catch (err) {
    throw new AppError(err.message || "Failed to clear cart", 500);
  }
};
