import {
  createProductService,
  getProductsByIdService,
  getAllProductsService,
  updateProductService,
  deleteProductService,
} from "../services/product.service.js";

export const createProductController = async (req, res, next) => {
  try {
    const product = await createProductService(req.body, req.file);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllProductsController = async (req, res, next) => {
  try {
    const products = await getAllProductsService();
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductsByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await getProductsByIdService(id);
    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProductController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedProduct = await updateProductService(id, req.body, req.file);
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProductController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedProduct = await deleteProductService(id);
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (err) {
    next(err);
  }
};
