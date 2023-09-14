const  express = require('express');
const  adminRoute = express.Router();
const adminController = require("../controller/adminContrl")
const passport = require('passport')
const {ensureAdmin}  = require('../middlewares/auth')



adminRoute.use((req,res,next)=>{
    req.app.set('layout', 'admin/layouts/adminLayout');
    next();
})

adminRoute.get('/',adminController.loadLogin)

  adminRoute.post('/',passport.authenticate('local', {
    
    successRedirect: '/admin/dashboard', // Use an absolute path
    failureRedirect: '/admin', // Use an absolute path
    failureFlash: true,
  }));


adminRoute.get('/dashboard',ensureAdmin,isAdminLogged,adminController.loadDashboard)
adminRoute.get('/logout',ensureAdmin,isAdminLogged,adminController.logout)


module.exports = adminRoute

function isAdminLogged (req,res,next){
  console.log( req.user);
  if(req.isAuthenticated()){
      next()
  }else{
      res.redirect('/')
  }
}

