const catchAsync = require('../utils/catchAsync');
const {
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  getCartItems,
  removeDeletedItemFromCart,
} = require('../services/cartServices');
const AppError = require('../utils/appError');

exports.addItem = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const { productId, quantity } = req.body;

  if (!userId) {
    return next(new AppError('Please login first'));
  }

  if (!productId) {
    return next(new AppError('Product ID required'));
  }

  const updatedCart = await addItemToCart(userId, productId, quantity);

  res.status(200).json({
    status: 'success',
    updatedCart,
  });
});

exports.deleteItem = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;

  if (!userId) {
    return next(new AppError('User information is missing', 500));
  }

  if (!productId) {
    return next(new AppError('Product Id Needed', 401));
  }

  const updatedCart = await removeItemFromCart(userId, productId);

  res.status(200).json({
    status: 'success',
    updatedCart,
  });
});

exports.updateItem = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return next(new AppError('Product ID or quantity are required'));
  }

  const updatedCart = await updateCartItem(userId, productId, quantity);

  res.status(200).json({
    status: 'success',
    updatedCart,
  });
});

exports.getItems = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  if (!userId) {
    return next(new AppError('Please login first'));
  }

  await removeDeletedItemFromCart(userId);

  const cart = await getCartItems(userId);

  res.status(200).json({
    status: 'success',
    cart,
  });
});
