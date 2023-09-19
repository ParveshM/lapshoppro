    const User = require('../models/userModel')
    const asyncHandler = require('express-async-handler')
    const {sendOtp,generateOTP} = require('../utility/nodeMailer')
    // require('dotenv').config()




    // loadLandingPage---
    const loadLandingPage = asyncHandler(async (req, res) => {
        try {
            res.render('./shop/pages/index') 
        } catch (error) {
            throw new Error(error)
        }

    })
    // loading register page---
    const loadRegister = async (req, res) => {

        try {  

            res.render('./shop/pages/register')
        } catch (error) {
            throw new Error(error)
        }
    }

    // inserting User-- 
    const insertUser = async (req, res) => {
        try {
            const emailCheck = req.body.email;
            const checkData = await User.findOne({ email: emailCheck });

            const mobileCheck = await User.findOne({ mobile: req.body.mobile });
            console.log('mobilechecking', mobileCheck);

            if (checkData) {
                return res.render('./shop/pages/register', { userCheck: "User already exists, please try with a new email" });
            } else if (mobileCheck) {
                return res.render('./shop/pages/register', { userCheck: "Mobile number already exists" });
            } else {
                const UserData = {
                    userName: req.body.userName,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    password: req.body.password,
                };

                const OTP = generateOTP()
                console.log('generated OTP',OTP);
                req.session.otpUser = { ...UserData, otp:OTP };
                req.session.mail = req.body.email;
                console.log(req.session.otpUser);
                console.log(req.body.email);

                try {              
                     sendOtp(req.body.email,OTP);  /* otp sending */               
                        console.log('inside trying sendOTP email and otp ',OTP);
                        return res.redirect('/sendOTP');               
                } catch (error) {
                   
                    console.error('Error sending OTP:', error);
                    return res.status(500).send('Error sending OTP');
                }
            }
        } catch (error) {
            throw new Error(error);
        }
    }

 // loadSentOTP page Loding--
 const sendOTPpage = asyncHandler(async(req,res)=>{
        try {            
            res.render('./shop/pages/verifyOTP')
        } catch (error) {
            throw new Error(error)
        }

    })

// verifyOTP route handler
const verifyOTP = asyncHandler(async (req, res) => {
    try {
        const enteredOTP = req.body.otp; 
        
        
        const storedOTP = req.session.otpUser.otp; // Get the stored OTP from the session
    
        const user = req.session.otpUser;
        console.log('entered',enteredOTP);
        console.log('Stored',storedOTP);

        if (enteredOTP == storedOTP) {
          console.log('inside eqaul checking');
            const newUser  = await User.create(user);
            
         if(newUser){
            console.log(newUser);
         }else{console.log('error in insert user')}
            delete req.session.otpUser.otp;
            res.redirect('/login');
        } else {
            console.log('verification failed');
           
        }
    } catch (error) {
        throw new Error(error);
    }
});

// ...


    // loading Login Page---
    const loadLogin = async (req, res) => {
        try {
            res.render('./shop/pages/login')
        } catch (error) { 
            throw new Error(error)
        }
    }

    // UserLogout----
    const userLogout = async (req,res)=>{
        try {
            req.logout(function(err) {

                if (err) {
                    next(err);
                    }})
            res.redirect('/')
        } catch (error) {
            console.log(error.message);
        }
    }

    // userProfile---
    const userProfile = async (req,res)=>{
        try {
            const person = req.user;
            console.log(person);
        } catch (error) {
            console.log(error.message);
        }
    }

    // Shopping Page--
    const shopping = asyncHandler(async (req,res)=>{
        try {
            res.render('./shop/pages/shopping')
        } catch (error) {
            throw new Error(error)
        }
    })

    // wishlist--
    const wishlist = asyncHandler(async (req,res)=>{
        try {
            res.render('./shop/pages/wishlist')
        } catch (error) {
            throw new Error(error)
        }
    })

    // contact page--
    const contact = asyncHandler(async (req,res)=>{
        try {
            res.render('./shop/pages/contact')
        } catch (error) {
            throw new Error(error)
        }
    })

    // About Us----

    const aboutUs = asyncHandler(async (req,res)=>{
        try {
            res.render('./shop/pages/about')
        } catch (error) {
            throw new Error(error)
        }
    })

    module.exports = {
        loadLandingPage,
        loadRegister,
        insertUser,
        sendOTPpage,
        verifyOTP,
        loadLogin, 
        userLogout,
        userProfile,
        shopping,
        wishlist,
        contact,
        aboutUs,

    }

