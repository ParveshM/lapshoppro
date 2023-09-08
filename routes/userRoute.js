const  express = require('express');
const  UserRoute = express.Router();
const userController = require("../controller/userController")

UserRoute.get('/',userController.loadLandingPage);

module.exports = UserRoute;
