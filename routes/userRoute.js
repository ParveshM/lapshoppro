const express = require('express');
const userRoute = express.Router();
const passport = require('passport')

const userController = require("../controller/userContrl")
const cartController = require('../controller/cartContrl')
const orderController = require('../controller/orderContrl')
const addressController = require('../controller/addressContrl')

const { ensureNotAuthenticated, ensureAuthenticated } = require('../middlewares/userAuth')
const validateID = require('../middlewares/idValidation')

userRoute.use((req, res, next) => {
  req.app.set('layout', 'shop/layouts/user');
  next();
})


// userRoute setting----
userRoute.get('/', userController.loadLandingPage); /* Loading home page */

userRoute.get('/register', ensureNotAuthenticated, userController.loadRegister); /* Register Page */
userRoute.post('/register', ensureNotAuthenticated, userController.insertUser);
userRoute.get('/sendOTP', ensureNotAuthenticated, userController.sendOTPpage); /* otp sending */
userRoute.post('/sendOTP', ensureNotAuthenticated, userController.verifyOTP);
userRoute.get('/reSendOTP', ensureNotAuthenticated, userController.reSendOTP); /* otp Resending */
userRoute.post('/reSendOTP', ensureNotAuthenticated, userController.verifyResendOTP);

// Login & Verification section---
userRoute.get('/login', ensureNotAuthenticated, userController.loadLogin);
userRoute.post('/login', ensureNotAuthenticated,
  passport.authenticate('local', {
    successRedirect: '/', // Redirect on successful login
    failureRedirect: '/login', // Redirect on failed login
    failureFlash: true, // enable flash messages
  }));
userRoute.get('/logout', ensureAuthenticated, userController.userLogout);

userRoute.get('/forgetPassword', ensureNotAuthenticated, userController.emailInputPage);
userRoute.post('/forgetPassword', ensureNotAuthenticated, userController.sendResetLink);

userRoute.get('/resetPassword', ensureNotAuthenticated, userController.resetPassPage);
userRoute.post('/resetPassword', ensureNotAuthenticated, userController.resetPassword);

userRoute.get('/contact', userController.contact);
userRoute.get('/about', userController.aboutUs);
userRoute.get('/profile', ensureAuthenticated, userController.userProfile);
 ` `

// shopping_section--- 
userRoute.get('/shop', userController.shopping);   /* shopping page */
userRoute.get('/viewProduct/:id',validateID, userController.viewProduct); /* view single product */
userRoute.get('/wishlist', ensureAuthenticated, userController.wishlist);

// cart_section-- 
userRoute.get('/cart', ensureAuthenticated, cartController.loadCartPage);
userRoute.get('/addtoCart/:id',validateID, ensureAuthenticated, cartController.addtoCart);
userRoute.get('/removeProduct/:id',validateID, ensureAuthenticated, cartController.removeProductfromCart);
userRoute.post('/updateCartItem/:id',
validateID, ensureAuthenticated, 
cartController.updateCartItemQuantity);
userRoute.get('/getCartItemCount',  cartController.getCartCount);
userRoute.get('/checkProductAvailability', ensureAuthenticated, cartController.checkProductAvailability);

// Address_Routes__
userRoute.get('/savedAddress',ensureAuthenticated,addressController.savedAddress)
userRoute.get('/addAddress',ensureAuthenticated,addressController.addAddressPage)
userRoute.post('/addAddress',ensureAuthenticated,addressController.insertAddress)
userRoute.get('/editAddress/:id',validateID,ensureAuthenticated,addressController.editAddressPage)
userRoute.post('/editAddress/:id',validateID,ensureAuthenticated,addressController.updateAddress)
userRoute.get('/deleteAddress/:id',validateID,ensureAuthenticated,addressController.deleteAddress)

//checkout and order section
userRoute.get('/checkout', ensureAuthenticated, orderController.checkoutPage); //checkout page
userRoute.post('/placeOrder', ensureAuthenticated, orderController.placeOrder); 
userRoute.get('/orders', ensureAuthenticated, orderController.orders); 
userRoute.post('/viewOrder/:id', ensureAuthenticated, orderController.viewOrder); 
userRoute.put('/cancelOrder/:id', ensureAuthenticated, orderController.cancelOrder);

// 404 notfound page--
userRoute.get('*',(req,res)=>{res.render('./shop/pages/404')})

module.exports = userRoute;
