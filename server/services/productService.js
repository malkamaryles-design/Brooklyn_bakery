const productModel = require('../models/productModel');
const getAllProducts = async () => productModel.fetchAll();
module.exports = { getAllProducts };