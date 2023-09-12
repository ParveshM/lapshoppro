const  express = require('express');
const  userRoute = express.Router();
const userAuth = require('../middlewares/userAuth')
const userController = require("../controller/userController")


// userRoute setting----
userRoute.get('/', userController.loadLandingPage);
userRoute.get('/register',userController.loadRegister);
userRoute.post('/register',userController.insertUser);
userRoute.get('/login',userController.loadLogin);
userRoute.post('/login',userController.verifyLogin);
userRoute.get('/logout',userController.userLogout);







module.exports = userRoute;
