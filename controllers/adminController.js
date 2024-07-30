const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Contactus = require('../models/contactusModel');

exports.getUser = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const { id } = req.body;

  const user = await User.findById(id);
  // console.log(user);

  if (!user) return next(new AppError('No user Found', 404));

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const data = req.body;

  const user = await User.findOneAndDelete(data);

  if (!user.length) return next(new AppError('No user Found', 401));

  res.status(200).json({
    status: 'success',
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const users = await User.find().skip(startIndex).limit(limit);

  if (!users.length) return next(new AppError('No user Found', 404));

  res.status(200).json({
    status: 'success',
    results: users.length,
    page,
    users,
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const data = req.body;

  const order = await Order.find(data).populate({
    path: 'items.productId',
    select: 'name',
  });

  if (!order.length) return next(new AppError('No order found', 404));

  res.status(200).json({
    status: 'success',
    order,
  });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const allOrders = await Order.find({
    paymentStatus: 'paid',
  })
    .sort({ createdAt: -1 })
    .populate({ path: 'items.productId', select: 'name' });

  if (!allOrders.length) return next(new AppError('No orders found', 200));

  res.status(200).json({
    status: 'success',
    allOrders,
  });
});

exports.getPendingOrders = catchAsync(async (req, res, next) => {
  const pendingOrders = await Order.find({
    paymentStatus: 'paid',
    status: 'pending',
  })
    .sort({ createdAt: 1 })
    .populate({ path: 'items.productId', select: 'name' });

  if (!pendingOrders.length) return next(new AppError('No orders found', 200));

  res.status(200).json({
    status: 'success',
    pendingOrders,
  });
});

exports.getCancelledOrders = catchAsync(async (req, res, next) => {
  const cancelledOrders = await Order.find({
    paymentStatus: 'paid',
    status: 'cancelled',
  })
    .sort({ createdAt: -1 })
    .populate({ path: 'items.productId', select: 'name' });

  if (!cancelledOrders.length)
    return next(new AppError('No cancelled orders found', 200));

  res.status(200).json({
    status: 'success',
    cancelledOrders,
  });
});

exports.getAcceptedOrders = catchAsync(async (req, res, next) => {
  const acceptedOrders = await Order.find({
    status: 'accepted',
    deliveryStatus: 'processing',
  })
    .sort({ createdAt: 1 })
    .populate({ path: 'items.productId', select: 'name' });

  if (!acceptedOrders.length)
    return next(new AppError('No accepted order Found', 200));

  res.status(200).json({
    status: 'success',
    acceptedOrders,
  });
});

exports.getInTransitOrders = catchAsync(async (req, res, next) => {
  const inTransitOrders = await Order.find({
    deliveryStatus: 'inTransit',
  })
    .sort({ createdAt: 1 })
    .populate({ path: 'items.productId', select: 'name' });

  if (!inTransitOrders.length)
    return next(new AppError('No InTransit orders Found', 200));

  res.status(200).json({
    status: 'success',
    inTransitOrders,
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const { id, status, deliveryStatus } = req.body;

  const order = await Order.findById(id).populate({
    path: 'items.productId',
    select: 'name',
  });

  if (!order) return next(new AppError('No order Found', 500));

  if (status) {
    order.status = status;
  }

  if (deliveryStatus) {
    order.deliveryStatus = deliveryStatus;
  }

  await order.save();

  res.status(200).json({
    status: 'success',
    order,
  });
});

exports.getUserQueries = catchAsync(async (req, res, next) => {
  const usersQueries = await Contactus.find();

  if (!usersQueries) return next(new AppError('No new queries'));

  res.status(200).json({
    status: 'success',
    usersQueries,
  });
});

exports.deleteUserQuery = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const id = req.body;

  const query = await Contactus.findByIdAndDelete(id);

  if (!query) return next(new AppError('Query not found'));

  res.status(200).json({
    status: 'success',
    data: null,
  });
});
