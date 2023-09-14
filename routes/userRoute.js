const  express = require('express');
const  userRoute = express.Router();
const passport = require('passport')
const userController = require("../controller/userContrl")


userRoute.use((req,res,next)=>{
    req.app.set('layout', 'shop/layouts/user');
    next();
})


// userRoute setting----
userRoute.get('/', userController.loadLandingPage);

userRoute.get('/register',ensureNotAuthenticated,userController.loadRegister);
userRoute.post('/register',ensureNotAuthenticated,userController.insertUser);

userRoute.get('/login',ensureNotAuthenticated,userController.loadLogin);
userRoute.post('/login',ensureNotAuthenticated,
 passport.authenticate('local', {
    successRedirect: '/', // Redirect on successful login
    failureRedirect: '/login', // Redirect on failed login
    failureFlash: true, // enable flash messages
  }));
userRoute.get('/logout',ensureAuthenticated,userController.userLogout);

userRoute.get('/profile',ensureAuthenticated,userController.userProfile);
userRoute.get('/shop',ensureAuthenticated,userController.shopping);
userRoute.get('/wishlist',ensureAuthenticated,userController.wishlist);
userRoute.get('/contact',userController.contact);
userRoute.get('/about',userController.aboutUs);





module.exports = userRoute;

function ensureAuthenticated (req,res,next){
    if(req.isAuthenticated()){
        next()
    }else{
        res.redirect('/login')
    }
}


function ensureNotAuthenticated (req,res,next){
    if(req.isAuthenticated()){
        res.redirect('back')
        
    }else{
        next()
    }
}