const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Wallet = require('../models/walletModel')
const Banner = require('../models/bannerModel')
const asyncHandler = require('express-async-handler')
const { sendOtp, generateOTP } = require('../utility/nodeMailer')
const { forgetPassMail } = require('../utility/forgetPassMail')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

// loadLandingPage---
const loadLandingPage = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find({ isListed: true }).populate('images').limit(4)
        console.log(products);

        const banner = await Banner.find({ isActive: true })
        res.render('./shop/pages/index', { products: products, banner })
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
            var messages = 'Verification failed, please check the OTP or resend it.';
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
const userProfile = asyncHandler(async (req, res) => {
    try {
        const user = req.user.id

        const findWallet = await User.findById(user).populate('wallet')
        console.log('din wlalet', findWallet);
        const walletId = findWallet.wallet._id
        const wal = await Wallet.find(walletId).populate('transactions').exec()


        const walletBalance = findWallet.wallet.balance;

        res.render('./shop/pages/profile', { user, walletBalance })
    } catch (error) {
        throw new Error(error);
    }
});

// view wallet history ---
const viewWalletHistory = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const findWallet = await User.findById(user).populate('wallet')
        const walletId = findWallet.wallet._id

        const walletTransaction = await Wallet.findById({ _id: walletId })
            .populate({
                path: 'transactions',
                options: {
                    sort: { timestamp: -1 } // Sort in descending order (latest first)
                }
            });
        const walletHistory = walletTransaction.transactions

        res.render('./shop/pages/walletHistory', { walletHistory })
    } catch (error) {
        throw new Error(error);
    }
});


// Shopping Page--
const shopping = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const page = req.query.p || 1;
        const limit = 2;

        const listedCategories = await Category.find({ isListed: true });
        // Get the IDs of the listed categories
        const listedCategoryIds = listedCategories.map(category => category._id);

        // Find products that belong to the listed categories
        const findProducts = await Product.find(
            { categoryName: { $in: listedCategoryIds }, isListed: true })
            .populate('images')
            .skip((page - 1) * limit)
            .limit(limit)

        let cartProductIds;
        if (user) {
            if (user.cart) {
                cartProductIds = user.cart.map(cartItem => cartItem.product.toString());
            }

        } else {
            cartProductIds = null;

        }

        const count = await Product.find(
            { categoryName: { $in: listedCategoryIds }, isListed: true })
            .countDocuments();


        res.render('./shop/pages/shopping', {
            products: findProducts,
            category: listedCategories,
            cartProductIds,
            user,
            currentPage: page,
            totalPages: Math.ceil(count / limit) // Calculating total pages
        });
    } catch (error) {
        throw new Error(error);
    }
});


// view Product Page--
const viewProduct = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id 
        const user = req.user
        const findProduct = await Product.findOne({ _id: id }).populate('categoryName').populate('images')
        if (!findProduct) {
            return res.status(404).render('./shop/pages/404')
        }
        const products = await Product.find({ isListed: true }).populate('images').limit(3)
        let cartProductIds;
        if (user) {
            cartProductIds = user.cart.map(cartItem => cartItem.product.toString());
        } else {
            cartProductIds = null;
        }
        res.render('./shop/pages/productDetail', { product: findProduct, products, cartProductIds })
    } catch (error) {
        throw new Error(error)
    }
})

// forgetPassword_ email inputPage--
const forgotPasswordpage = asyncHandler(async (req, res) => {
    try {
        res.render('./shop/pages/forgetPassEmail')
    } catch (error) {
        throw new Error(error)
    }
})

// sendEmail to reset password--
const sendResetLink = asyncHandler(async (req, res) => {
    try {
        console.log('use', req.body.email);
        const email = req.body.email;
        const user = await User.findOne({ email: email });

        if (!user) {
            req.flash('danger', `User Not found for this ${email}`)
            res.redirect("/forgetPassword");

        }

        const resetToken = await user.createResetPasswordToken();
        await user.save();

        const resetUrl = `${req.protocol}://${req.get("host")}/resetPassword/${resetToken}`;

        try {
            forgetPassMail(email, resetUrl, user.userName);
            req.flash('info', `Reset Link sent to this ${email}`)
            res.redirect("/forgetPassword");

        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetTokenExpires = undefined;
            console.error(error);
            console.log("There was an error sending the password reset email, please try again later");

            req.flash('Warning', 'Error in sending Email')
            return res.redirect("/forgetPassword");
        }

    } catch (error) {
        throw new Error(error)
    }
})

// Reset Password page GET
const resetPassPage = asyncHandler(async (req, res) => {
    try {

        const token = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = await User.findOne({ passwordResetToken: token, passwordResetTokenExpires: { $gt: Date.now() } });

        if (!user) {
            req.flash('warning', 'Token expired or Invalid')
            res.redirect("/forgetPassword");
        }

        res.render("./shop/pages/resetPassword", { token });

    } catch (error) {
        throw new Error(error)
    }
})

// Resetting the password-- POST
const resetPassword = asyncHandler(async (req, res) => {

    const token = req.params.token;
    try {
        const user = await User.findOne({ passwordResetToken: token, passwordResetTokenExpires: { $gt: Date.now() } });

        if (!user) {

            req.flash('warning', 'Token expired or Invalid')
            res.redirect("/forgetPassword");
        }
        const salt = bcrypt.genSaltSync(10);
        hashedPassword = await bcrypt.hash(req.body.password, salt);

        user.password = hashedPassword;
        user.passwordResetToken = null;
        user.passwordResetTokenExpires = null;
        user.passwordChangedAt = Date.now();

        await user.save();

        console.log('password vhange', user.password)
        req.flash("success", "Password changed");
        res.redirect("/login");

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
    viewWalletHistory,
    shopping,
    viewProduct,
    wishlist,
    contact,
    aboutUs,
    forgotPasswordpage,
    sendResetLink,
    resetPassPage,
    resetPassword


}

