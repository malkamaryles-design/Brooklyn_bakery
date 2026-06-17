const mongoose = require('mongoose'); 
const productSchema = new mongoose.Schema({ 
  name:        { type: String, required: true },  
  price:       { type: Number, required: true },  
  imageUrl:    { type: String },                  
  category:    { type: String },                  
  description: { type: String },                  
  weight:      { type: Number },                  
  available:       { type: Boolean, default: true },  
  unavailableNote: { type: String,  default: '' },    
}, { collection: 'products' }); 
const Product = mongoose.model('Product', productSchema); 
const fetchAll  = async ()              => Product.find({});                                          
const fetchById = async (id)            => Product.findById(id);                                      
const fetchByIds = async (ids)          => Product.find({ _id: { $in: ids } });                       
const createProduct = async (data)      => Product.create(data);                                      
const updateProduct = async (id, data)  => Product.findByIdAndUpdate(id, data, { new: true });        
const deleteProduct = async (id)        => Product.findByIdAndDelete(id);                             
module.exports = { fetchAll, fetchById, fetchByIds, createProduct, updateProduct, deleteProduct }; 