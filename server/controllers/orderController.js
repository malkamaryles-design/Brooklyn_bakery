const orderService = require('../services/orderService');
const { VALID_STATUSES } = require('../constants/orderStatus');
const { ORDER_ERRORS, CART_ERRORS, sendError } = require('../constants/errors');
const asyncHandler = require('../middleware/asyncHandler');
const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { customer, delivery } = req.body;
  if (!customer?.name || !customer?.email || !customer?.phone) {
    return sendError(res, ORDER_ERRORS.MISSING_CUSTOMER);
  }
  if (!delivery?.type || !['pickup', 'delivery'].includes(delivery.type)) {
    return sendError(res, ORDER_ERRORS.INVALID_DELIVERY);
  }
  if (delivery.type === 'delivery' && !delivery.address?.trim()) {
    return sendError(res, ORDER_ERRORS.MISSING_ADDRESS);
  }
  const order = await orderService.createOrder(userId, customer, delivery);
  if (!order) return sendError(res, CART_ERRORS.EMPTY_CART);
  res.status(201).json({ order });
});
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.userId);
  res.json(orders);
});
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getAllOrders();
  res.json(orders);
});
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return sendError(res, ORDER_ERRORS.INVALID_STATUS);
  }
  const order = await orderService.updateStatus(req.params.id, status);
  if (!order) return sendError(res, ORDER_ERRORS.NOT_FOUND);
  res.json({ order });
});
module.exports = { placeOrder, getMyOrders, getAllOrders, updateOrderStatus };