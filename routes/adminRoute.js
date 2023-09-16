const  express = require('express');
const  adminRoute = express.Router();
const adminController = require("../controller/adminContrl")
const categoryController = require('../controller/categoryContrl')
const productController = require('../controller/productContrl')



adminRoute.use((req,res,next)=>{
    req.app.set('layout', 'admin/layouts/adminLayout');
    next();
})

// admin loginManagement---
adminRoute.get('/',adminController.loadLogin)
adminRoute.post('/',adminController.verifyAdmin);
adminRoute.get('/logout',adminController.logout)
 
// adminController.userManagement---
adminRoute.get('/dashboard',adminController.loadDashboard)
adminRoute.get('/user',adminController.userManagement) 
adminRoute.post('/user/blockUser/:id',adminController.blockUser)
adminRoute.post('/user/unBlockUser/:id',adminController.unBlockUser)
 
// categoryManagement--- 
adminRoute.get('/category',categoryController.categoryManagement)
adminRoute.get('/addCategory',categoryController.addCategory)
adminRoute.post('/addCategory',categoryController.insertCategory)
adminRoute.post('/category/list/:id',categoryController.list)
adminRoute.post('/category/unList/:id',categoryController.unList)
adminRoute.get('/editCategory/:id',categoryController.editCategory)
adminRoute.post('/editCategory/:id',categoryController.updateCategory)
adminRoute.post('/deleteCategory/:id',categoryController.deleteCategory)
 
// Product Management---
adminRoute.get('/product/addProduct',productController.addProduct)
adminRoute.post('/product/addProduct',productController.insertProduct)
 


module.exports = adminRoute

// function isAdminLogged (req,res,next){
//   console.log( req.user);
//   if(req.isAuthenticated()){
//       next()
//   }else{
//       res.redirect('/')
//   }
// } 

