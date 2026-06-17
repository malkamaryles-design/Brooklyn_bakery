const productModel = require('../models/productModel');
const createProduct = async (data) => {
  return productModel.createProduct(data);
};
const updateProduct = async (productId, data) => {
  return productModel.updateProduct(productId, data);
};
const deleteProduct = async (productId) => {
  return productModel.deleteProduct(productId);
};
module.exports = { createProduct, updateProduct, deleteProduct };