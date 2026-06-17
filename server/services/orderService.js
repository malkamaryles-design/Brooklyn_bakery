const mongoose = require('mongoose');
const orderModel = require('../models/orderModel');
const { fetchCartForOrder, clearCart } = require('../models/cartModel');
const { sendOrderConfirmation } = require('./emailService');
const createOrder = async (userId, customer, delivery) => {
  const session = await mongoose.startSession();
  let order;
  try {
    session.startTransaction();// להעביר למודלס
    const cartData = await fetchCartForOrder(userId, session);
    if (!cartData) {
      await session.abortTransaction();
      return null;
    }
    const { items, total } = cartData;
    const [created] = await orderModel.Order.create(
      [{ userId, customer, delivery, items, total }],
      { session }
    );
    order = created;
    await clearCart(userId, session);
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
  sendOrderConfirmation(order);
  return order;
};
const getUserOrders = async (userId) => {
  return orderModel.findByUserId(userId);
};
const getAllOrders = async () => {
  return orderModel.findAll();
};
const updateStatus = async (orderId, status) => {
  return orderModel.updateStatusById(orderId, status);
};
module.exports = { createOrder, getUserOrders, getAllOrders, updateStatus };