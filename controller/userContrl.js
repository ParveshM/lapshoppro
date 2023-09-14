const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')
// const passport = require('passport')



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
        console.log(req.body);

        const emailCheck = req.body.email;
        const checkData = await User.findOne({ email: emailCheck })  /*checking is user existing or not*/
        if (checkData) {
            res.render('./shop/pages/register', { userCheck: "User already exists ,Please try with new email" })
        } else {
            const UserData = await User.create(req.body);  /* User inserted*/
            if (UserData) {
                res.render('./shop/pages/register', { message: "Registration Successfull ,Please Login" })
            }
        }

    } catch (error) {
        throw new Error(error)
    }
}

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
    loadLogin, 
    userLogout,
    userProfile,
    shopping,
    wishlist,
    contact,
    aboutUs
}
