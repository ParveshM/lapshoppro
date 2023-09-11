const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')
const {generateToken} = require('../config/jwtToken')



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

// verifying Login---
const verifyLogin = async (req, res) => {
    try {

        const { email, password } = req.body

         const findUser = await User.findOne({email})
         if(findUser&& await findUser.isPasswordMatched(password)){  /* Checking the user credentials */
         const _id = findUser?._id   
        token = generateToken(_id);
        console.log("generated Token is "+token);
         res.redirect('/')

         }else{
            res.render('./shop/pages/login',{message:'Invalid User Credentials'})
         }


    } catch (error) {
        throw new Error(error)
    }
}


module.exports = {
    loadLandingPage,
    loadRegister,
    insertUser,
    loadLogin,
    verifyLogin,

}

