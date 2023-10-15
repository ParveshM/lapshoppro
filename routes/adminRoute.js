const express = require('express');
const adminRoute = express.Router();
const adminController = require("../controller/adminContrl")
const categoryController = require('../controller/categoryContrl')
const productController = require('../controller/productContrl')
const orderController = require('../controller/orderContrl')
const couponController = require('../controller/couponController')
const bannerController = require('../controller/bannerContrl')
const { upload } = require('../config/upload')
const { isAdminLoggedIn, isAdminLoggedOut } = require('../middlewares/adminAuth')
const { adminValidateID } = require('../middlewares/idValidation')
const nocache = require('nocache')
require('dotenv').config()

adminRoute.use((req, res, next) => {
    req.app.set('layout', 'admin/layouts/adminLayout');
    next();
})
adminRoute.use(nocache())

// admin loginManagement---
adminRoute.get('/', isAdminLoggedOut, adminController.loadLogin)
adminRoute.post('/', adminController.verifyAdmin);
adminRoute.get('/logout', isAdminLoggedIn, adminController.logout)

// adminController.userManagement---
adminRoute.get('/dashboard', isAdminLoggedIn, adminController.loadDashboard)
adminRoute.get('/user', isAdminLoggedIn, adminController.userManagement)
adminRoute.post('/user/search', isAdminLoggedIn, adminController.searchUser)
adminRoute.post('/user/blockUser/:id', adminValidateID, isAdminLoggedIn, adminController.blockUser)
adminRoute.post('/user/unBlockUser/:id', adminValidateID, isAdminLoggedIn, adminController.unBlockUser)

// categoryManagement--- 
adminRoute.get('/category', isAdminLoggedIn, categoryController.categoryManagement)
adminRoute.get('/addCategory', isAdminLoggedIn, categoryController.addCategory)
adminRoute.post('/addCategory', isAdminLoggedIn, categoryController.insertCategory)
adminRoute.get('/category/list/:id', adminValidateID, isAdminLoggedIn, categoryController.list)
adminRoute.get('/category/unList/:id', adminValidateID, isAdminLoggedIn, categoryController.unList)
adminRoute.get('/editCategory/:id', adminValidateID, isAdminLoggedIn, categoryController.editCategory)
adminRoute.post('/editCategory/:id', adminValidateID, isAdminLoggedIn, categoryController.updateCategory)
adminRoute.post('/category/search', isAdminLoggedIn, categoryController.searchCategory)

// Product Management---
adminRoute.get('/product/addProduct', isAdminLoggedIn, productController.addProduct)

adminRoute.post('/product/addProduct',
    upload.fields([
        { name: "secondaryImage" }
        , { name: "primaryImage" }]),
    productController.insertProduct)  /** Product adding and multer using  **/
adminRoute.get('/products', isAdminLoggedIn, productController.productManagement)
adminRoute.post('/product/list/:id', adminValidateID, isAdminLoggedIn, productController.listProduct)
adminRoute.post('/product/unList/:id', adminValidateID, isAdminLoggedIn, productController.unListProduct)
adminRoute.get('/product/editproduct/:id', adminValidateID, isAdminLoggedIn, productController.editProductPage)
adminRoute.post('/product/editproduct/:id', adminValidateID,
    upload.fields([
        { name: "secondaryImage" }
        , { name: "primaryImage" }]),
    productController.updateProduct)


// OrderManagement--
adminRoute.get('/orders', isAdminLoggedIn, orderController.ordersPage)
adminRoute.get('/orders/editOrder/:id', adminValidateID, isAdminLoggedIn, orderController.editOrderPage)
adminRoute.post('/orders/editOrder/:id', adminValidateID, isAdminLoggedIn, orderController.updateOrder)

// Coupon Management---
adminRoute.get('/coupons', isAdminLoggedIn, couponController.listCoupons)
adminRoute.get('/coupon/add-coupon', isAdminLoggedIn, couponController.addCouponPage)
adminRoute.post('/coupon/add-coupon', isAdminLoggedIn, couponController.createCoupon)
adminRoute.get('/coupons/edit-coupon/:id', adminValidateID, isAdminLoggedIn, couponController.editCouponPage)
adminRoute.post('/coupons/edit-coupon/:id', adminValidateID, isAdminLoggedIn, couponController.editCoupon)

// Banner management --
adminRoute.get('/banners', isAdminLoggedIn, bannerController.listBanners)
adminRoute.get('/banner/add-banner', isAdminLoggedIn, bannerController.addBannerPage)
adminRoute.post('/banner/add-banner', upload.single("bannerImage"), isAdminLoggedIn, bannerController.createBanner)
// adminRoute.get('/banner/edit-banner/:id', isAdminLoggedIn, bannerController.editBannerPage)
adminRoute.post('/banner/updateBannerStatus/:id',adminValidateID, isAdminLoggedIn, bannerController.updateBannerStatus)



adminRoute.get('*', (req, res) => { res.render('./admin/page404', { title: 'Error' }) })


module.exports = adminRoute



