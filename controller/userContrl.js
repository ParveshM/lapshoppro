const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const asyncHandler = require('express-async-handler')
const { sendOtp, generateOTP } = require('../utility/nodeMailer')

// loadLandingPage---
const loadLandingPage = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find({ isListed: true })
        res.render('./shop/pages/index', { products: products })
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
        if (checkData) {
            return res.render('./shop/pages/register', { userCheck: "User already exists, please try with a new email" });
        } else {
            const UserData = {
                userName: req.body.userName,
                email: req.body.email,
                password: req.body.password,
            };

            const OTP = generateOTP() /** otp generating **/
            req.session.otpUser = { ...UserData, otp: OTP };
            // req.session.mail = req.body.email;  

            /***** otp sending ******/
            try {
                sendOtp(req.body.email, OTP, req.body.userName);
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
/*************** OTP Section *******************/
// loadSentOTP page Loding--
const sendOTPpage = asyncHandler(async (req, res) => {
    try {
        const email = req.session.otpUser.email
        res.render('./shop/pages/verifyOTP', { email })
    } catch (error) {
        throw new Error(error)
    }

})

// verifyOTP route handler
const verifyOTP = asyncHandler(async (req, res) => {
    try {

        const enteredOTP = req.body.otp;
        const storedOTP = req.session.otpUser.otp; // Getting the stored OTP from the session
        const user = req.session.otpUser;

        if (enteredOTP == storedOTP) {
            const newUser = await User.create(user);

            delete req.session.otpUser.otp;
            res.redirect('/login');
        } else {
            messages = 'Verification failed, please check the OTP or resend it.';
            console.log('verification failed');

        }
        res.render('./shop/pages/verifyOTP', { messages })


    } catch (error) {
        throw new Error(error);
    }
});
/**********************************************/

// Resending OTP---
const reSendOTP = async (req, res) => {
    try {
        const OTP = generateOTP() /** otp generating **/
        req.session.otpUser.otp = { otp: OTP };

        const email = req.session.otpUser.email
        const userName = req.session.otpUser.userName


        /***** otp resending ******/
        try {
            sendOtp(email, OTP, userName);
            console.log('otp is sent');
            return res.render('./shop/pages/reSendOTP', { email });
        } catch (error) {
            console.error('Error sending OTP:', error);
            return res.status(500).send('Error sending OTP');
        }

    } catch (error) {
        throw new Error(error)
    }
}

// verify resendOTP--
const verifyResendOTP = asyncHandler(async (req, res) => {
    try {
        const enteredOTP = req.body.otp;
        const storedOTP = req.session.otpUser.otp;
        const user = req.session.otpUser;

        if (enteredOTP == storedOTP.otp) {
            console.log('inside verification');
            const newUser = await User.create(user);
            if (newUser) {
                console.log('new user insert in resend page', newUser);
            } else { console.log('error in insert user') }
            delete req.session.otpUser.otp;
            res.redirect('/login');
        } else {
            console.log('verification failed');
        }
    } catch (error) {
        throw new Error(error);
    }
});


// loading Login Page---
const loadLogin = async (req, res) => {
    try {
        res.render('./shop/pages/login')
    } catch (error) {
        throw new Error(error)
    }
}

// UserLogout----
const userLogout = async (req, res) => {
    try {
        req.logout(function (err) {

            if (err) {
                next(err);
            }
        })
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}

// userProfile---
const userProfile = async (req, res) => {
    try {
        const person = req.user;
        console.log(person);
    } catch (error) {
        console.log(error.message);
    }
}
// loading address page---
const loadAddressPage = async (req, res) => {
    try {       
        res.render('./shop/pages/addAddress')
    } catch (error) {
        console.log(error.message);
    }
}

// Shopping Page--
const shopping = asyncHandler(async (req, res) => {
    try {
        const user = req.user
        const listedCategories = await Category.find({ isListed: true });
        // Get the IDs of the listed categories
        const listedCategoryIds = listedCategories.map(category => category._id);
        // Find products that belong to the listed categories
        const findProducts = await Product.find({ categoryName: { $in: listedCategoryIds }, isListed: true });

        const cartProductIds = user.cart.map(cartItem => cartItem.product.toString());

        res.render('./shop/pages/shopping', { products: findProducts, category: listedCategories, cartProductIds });
    } catch (error) {
        throw new Error(error);
    }
});


// view Product Page--
const viewProduct = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id
        const user = req.user
        const findProduct = await Product.findOne({ _id: id }).populate('categoryName').exec()
        if (!findProduct) {
            return res.status(404).render('./shop/pages/404')
        }
        const products = await Product.find({ isListed: true })
        const cartProductIds = user.cart.map(cartItem => cartItem.product.toString());

        res.render('./shop/pages/productDetail', { product: findProduct, products: products, cartProductIds })
    } catch (error) {
        throw new Error(error)
    }
})


// wishlist--
const wishlist = asyncHandler(async (req, res) => {
    try {
        res.render('./shop/pages/wishlist')
    } catch (error) {
        throw new Error(error)
    }
})

// contact page--
const contact = asyncHandler(async (req, res) => {
    try {
        res.render('./shop/pages/contact')
    } catch (error) {
        throw new Error(error)
    }
})

// About Us----
const aboutUs = asyncHandler(async (req, res) => {
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
    reSendOTP,
    verifyResendOTP,
    loadLogin,
    userLogout,
    userProfile,
    loadAddressPage,
    shopping,
    viewProduct,
    wishlist,
    contact,
    aboutUs,

}

