const express = require('express');
const adminRoute = express.Router();
const adminController = require("../controller/adminContrl")
const categoryController = require('../controller/categoryContrl')
const productController = require('../controller/productContrl')
const { upload } = require('../config/upload')
const { isAdminLoggedIn, isAdminLoggedOut } = require('../middlewares/adminAuth')
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
adminRoute.post('/user/blockUser/:id', isAdminLoggedIn, adminController.blockUser)
adminRoute.post('/user/unBlockUser/:id', isAdminLoggedIn, adminController.unBlockUser)

// categoryManagement--- 
adminRoute.get('/category', isAdminLoggedIn, categoryController.categoryManagement)
adminRoute.get('/addCategory', isAdminLoggedIn, categoryController.addCategory)
adminRoute.post('/addCategory', isAdminLoggedIn, categoryController.insertCategory)
adminRoute.get('/category/list/:id', isAdminLoggedIn, categoryController.list)
adminRoute.get('/category/unList/:id', isAdminLoggedIn, categoryController.unList)
adminRoute.get('/editCategory/:id', isAdminLoggedIn, categoryController.editCategory)
adminRoute.post('/editCategory/:id', isAdminLoggedIn, categoryController.updateCategory)
adminRoute.post('/category/search', isAdminLoggedIn, categoryController.searchCategory)

// Product Management---
adminRoute.get('/product/addProduct', isAdminLoggedIn, productController.addProduct)
 
adminRoute.post('/product/addProduct',
    upload.fields([
        { name: "secondaryImage" }
        , { name: "primaryImage" }]),
    productController.insertProduct)  /** Product adding and multer using  **/
adminRoute.get('/products', isAdminLoggedIn, productController.productManagement)
adminRoute.post('/product/list/:id', isAdminLoggedIn, productController.listProduct)
adminRoute.post('/product/unList/:id', isAdminLoggedIn, productController.unListProduct)
adminRoute.get('/product/editproduct/:id', isAdminLoggedIn, productController.editProductPage)
adminRoute.post('/product/editproduct/:id',
    upload.fields([
        { name: "secondaryImage" }
        , { name: "primaryImage" }]),
    productController.updateProduct)

adminRoute.get('*', (req, res) => { res.render('./admin/page404', { title: 'Error' }) })


module.exports = adminRoute



