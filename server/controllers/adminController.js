const adminService = require('../services/adminService');
const asyncHandler = require('../middleware/asyncHandler');
const { PRODUCT_ERRORS, sendError } = require('../constants/errors');
const createProduct = asyncHandler(async (req, res) => {
  const { name, price } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'שם מוצר הוא שדה חובה' });
  }
  if (price === undefined || price === null || price === '') {
    return res.status(400).json({ error: 'מחיר הוא שדה חובה' });
  }
  if (isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ error: 'מחיר חייב להיות מספר אי-שלילי' });
  }
  const product = await adminService.createProduct({ ...req.body, price: Number(price) });
  res.status(201).json(product);
});
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price } = req.body;
  if (name !== undefined && !String(name).trim()) {
    return res.status(400).json({ error: 'שם מוצר לא יכול להיות ריק' });
  }
  if (price !== undefined && price !== null && price !== '') {
    if (isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ error: 'מחיר חייב להיות מספר אי-שלילי' });
    }
    req.body.price = Number(price);
  }
  const product = await adminService.updateProduct(req.params.id, req.body);
  if (!product) return sendError(res, PRODUCT_ERRORS.NOT_FOUND);
  res.json(product);
});
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await adminService.deleteProduct(req.params.id);
  if (!product) return sendError(res, PRODUCT_ERRORS.NOT_FOUND);
  res.json({ success: true });
});
module.exports = { createProduct, updateProduct, deleteProduct };