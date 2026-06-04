import AppError from "../utils/AppError.js";
import db from "../models/index.js";

const formatProduct = (product) => {
  if (!product) return product;

  const obj = product.toJSON();

  return {
    ...obj,
    price: Number(obj.price),
  };
};

export const createProductService = async (data, file) => {
  try {
    const { name, category, description, price, stock } = data;

    if (!name || price === undefined) {
      throw new AppError("Name and price are required", 400);
    }

    if (price <= 0) {
      throw new AppError("Price must be greater than zero", 400);
    }

    if (stock !== undefined && stock < 0) {
      throw new AppError("Stock cannot be negative", 400);
    }

    const image = file
      ? `/uploads/products/${file.filename}`
      : "/uploads/products/default.png";

    const product = await db.Product.create({
      name,
      category,
      description,
      price,
      stock,
      image,
    });

    return formatProduct(product);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to create product", 500);
  }
};

export const getAllProductsService = async () => {
  try {
    const products = await db.Product.findAll({
      order: [["updatedAt", "DESC"]],
    });

    return products.map(formatProduct);
  } catch (err) {
    throw new AppError(
      err.message || "Failed to fetch products",
      err.statusCode || 500,
    );
  }
};

export const getProductsByIdService = async (id) => {
  try {
    const product = await db.Product.findByPk(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return formatProduct(product);
  } catch (err) {
    throw new AppError(
      err.message || "Failed to fetch product",
      err.statusCode || 500,
    );
  }
};

export const updateProductService = async (id, data, file) => {
  try {
    const product = await db.Product.findByPk(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const { name, category, description, price, stock } = data;

    if (price !== undefined && price <= 0) {
      throw new AppError("Price must be greater than zero", 400);
    }

    if (stock !== undefined && stock < 0) {
      throw new AppError("Stock cannot be negative", 400);
    }

    const image = file ? `/uploads/products/${file.filename}` : product.image;

    await product.update({
      name: name ?? product.name,
      category: category ?? product.category,
      description: description ?? product.description,
      price: price ?? product.price,
      stock: stock ?? product.stock,
      image,
    });

    return formatProduct(product);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to update product", 500);
  }
};

export const deleteProductService = async (id) => {
  try {
    const product = await db.Product.findByPk(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    await product.destroy();
    return id;
  } catch (err) {
    throw new AppError(
      err.message || "Failed to delete product",
      err.statusCode || 500,
    );
  }
};
