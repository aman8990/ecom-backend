const express = require('express');
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('admin'));

router.post('/getUser', adminController.getUser);
router.get('/getAllUsers', adminController.getAllUsers);

router.get('/getAllOrders', adminController.getAllOrders);
router.get('/getAcceptedOrders', adminController.getAcceptedOrders);
router.get('/getInTransitOrders', adminController.getInTransitOrders);
router.get('/getPendingOrders', adminController.getPendingOrders);
router.get('/getCancelledOrders', adminController.getCancelledOrders);

router
  .route('/order')
  .post(adminController.getOrder)
  .patch(adminController.updateOrderStatus);

router.post('/createNewProduct', productController.createNewProduct);

router
  .route('/product')
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

router
  .route('/queries')
  .get(adminController.getUserQueries)
  .delete(adminController.deleteUserQuery);

module.exports = router;
