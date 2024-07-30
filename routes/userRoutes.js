const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const productController = require('../controllers/productController');
const paymentController = require('../controllers/paymentController');
const cashfreeController = require('../controllers/cashfreeController');

const router = express.Router();

router.get('/checkAuth', authController.isLoggedIn);

router.post('/signup', authController.signup);
router.patch('/verifyEmail', authController.verifyEmail);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/contactUs', userController.contactUs);

router.post('/forgotPassword', authController.forgotPassword);
router
  .route('/resetPassword')
  .post(authController.validateResetToken)
  .patch(authController.resetPassword);

router.post('/getProduct', productController.getProduct);

router.get('/getAllProducts', productController.getAllProducts);

router.use(authController.protect);

router.post('/stripe/pay', paymentController.pay);

router.post('/stripe/verify', paymentController.verifyPay);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.get('/getCart', cartController.getItems);
router.delete('/deleteItemFromCart', cartController.deleteItem);
router.post('/addItemToCart', cartController.addItem);
router.patch('/updateCartItem', cartController.updateItem);

router.get('/userOrders', userController.getUserOrders);
router.post('/userOrder', userController.getUserOrder);

router.get('/cashfree', cashfreeController.createOrder);
router.post('/cashfree/verify', cashfreeController.verifyOrder);

module.exports = router;
