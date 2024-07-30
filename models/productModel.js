const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
  },
  photo: {
    type: String,
    required: [true, 'Please provide product image'],
  },
  description: {
    type: String,
    required: [true, 'Please provide product description'],
  },
  images: {
    type: [String],
    required: [true, 'Please provide all product images'],
  },
  fullDescription: {
    type: [String],
    required: [true, 'Please provide product full description'],
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
