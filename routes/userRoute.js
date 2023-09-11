const  express = require('express');
const  userRoute = express.Router();

const userController = require("../controller/userController")


// userRoute setting----
userRoute.get('/',userController.loadLandingPage);
userRoute.get('/register',userController.loadRegister);
userRoute.post('/register',userController.insertUser);
userRoute.get('/login',userController.loadLogin);
userRoute.post('/login',userController.verifyLogin);






module.exports = userRoute;
