const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createNewProduct = catchAsync(async (req, res, next) => {
  const { name, price, photo, description, images, fullDescription } = req.body;

  const newProduct = await Product.create({
    name,
    price,
    description,
    photo,
    images,
    fullDescription,
  });

  res.status(200).json({
    status: 'success',
    newProduct,
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const { id } = req.body;

  const query = Product.findById(id);
  const doc = await query;

  if (!doc) return next(new AppError('No product found with this id', 404));

  res.status(200).json({
    status: 'success',
    doc,
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const { id, data } = req.body;
  const doc = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!doc) return next(new AppError('No product found with that ID', 404));

  res.status(200).json({
    status: 'success',
    doc,
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.body;

  await Product.findByIdAndDelete(id);

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({});

  res.status(200).json({
    status: 'success',
    products,
  });
});
