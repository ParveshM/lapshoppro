const  express = require('express');
const  userRoute = express.Router();
const passport = require('passport')
const userController = require("../controller/userController")


// userRoute setting----
userRoute.get('/', userController.loadLandingPage);
userRoute.get('/register',userController.loadRegister);
userRoute.post('/register',userController.insertUser);
userRoute.get('/login',userController.loadLogin);
// userRoute.post('/login',userController.verifyLogin);

userRoute.post('/login', passport.authenticate('local', {
    successRedirect: '/', // Redirect on successful login
    failureRedirect: '/login', // Redirect on failed login
    failureFlash: true, // enable flash messages
  }));
userRoute.get('/logout',userController.userLogout);







module.exports = userRoute;
