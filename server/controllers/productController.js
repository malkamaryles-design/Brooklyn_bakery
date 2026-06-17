const productService = require('../services/productService');
const asyncHandler = require('../middleware/asyncHandler');
const getProducts = asyncHandler(async (req, res) => {
  res.json(await productService.getAllProducts());
});
module.exports = { getProducts };