const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Wallet = require('../models/walletModel')
const Banner = require('../models/bannerModel')
const asyncHandler = require('express-async-handler')
const { sendOtp, generateOTP } = require('../utility/nodeMailer')
const { forgetPassMail } = require('../utility/forgetPassMail')
const { isValidQueryId } = require('../middlewares/idValidation')
const { generateReferralCode, creditforRefferedUser, creditforNewUser } = require('../helpers/referralHelper')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

// loadLandingPage---
const loadLandingPage = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find({ isListed: true }).populate('images').limit(4)
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
        console.log('req bodt', req.body);
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
            if (req.body.referralCode) {
                UserData.referralCode = req.body.referralCode
            }
            console.log('data for inserting', UserData);


            const OTP = generateOTP() /** otp generating **/
            req.session.otpUser = { ...UserData, otp: OTP };

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
        console.log('stored otp ', storedOTP, 'user', user);
        if (enteredOTP == storedOTP) {
            // if referral is found the reffered user get cashback
            let userFound = null;
            if (user.referralCode) {
                const referralCode = user.referralCode.trim()
                userFound = await creditforRefferedUser(referralCode)
            }
            const newUser = await User.create(user);
            if (newUser) {
                const referalCode = generateReferralCode(8)
                const createWallet = await Wallet.create({ user: newUser._id })
                newUser.wallet = createWallet._id
                newUser.referralCode = referalCode;
                newUser.save();
                if (userFound) {
                    await creditforNewUser(newUser)
                }
            }
            delete req.session.otpUser.otp;
            if (!userFound) {
                req.flash('warning', 'Registration success , Please login , Invalid referral code!')
            } else {
                req.flash('success', 'Registration success , Please login')
            }
            res.redirect('/login');
        } else {
            const messages = 'Verification failed, please check the OTP or resend it.';
            console.log('verification failed');
            res.render('./shop/pages/verifyOTP', { messages })
        }
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
            let userFound = null;
            if (user.referralCode) {
                const referralCode = user.referralCode.trim()
                userFound = await creditforRefferedUser(referralCode)
            }
            const newUser = await User.create(user);
            if (newUser) {
                const referalCode = generateReferralCode(8)
                const createWallet = await Wallet.create({ user: newUser._id })
                newUser.wallet = createWallet._id
                newUser.referralCode = referalCode;
                newUser.save();
                if (userFound) {
                    await creditforNewUser(newUser._id)
                }
            } else {
                console.log('error in insert user')
            }
            delete req.session.otpUser.otp;

            if (!userFound) {
                req.flash('warning', 'Registration success , Please login , Invalid referral code!')
            } else {
                req.flash('success', 'Registration success , Please login')
            } res.redirect('/login');
        } else {
            res.redirect('/register')
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
        const user = req.user

        const findWallet = await User.findById(user).populate('wallet')
        let walletBalance = 0;
        if (findWallet.wallet) {
            const walletId = findWallet.wallet._id
            const wal = await Wallet.find(walletId).populate('transactions').exec()
            walletBalance = findWallet.wallet.balance;
        }

        res.render('./shop/pages/profile', { user, walletBalance })
    } catch (error) {
        throw new Error(error);
    }
});

// Edit users name
const editUserName = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id
    
    } catch (error) {
        throw new Error(error);
    }
});

// view wallet history ---
const viewWalletHistory = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const findWallet = await User.findById(user).populate('wallet')
        let walletHistory = false;
        if (findWallet.wallet) {
            const walletId = findWallet.wallet._id

            const walletTransaction = await Wallet.findById({ _id: walletId })
                .populate({
                    path: 'transactions',
                    options: {
                        sort: { timestamp: -1 } // Sort in descending order (latest first)
                    }
                });
            walletHistory = walletTransaction.transactions
        }

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
        // Get the IDs of the listed categories
        const listedCategories = await Category.find({ isListed: true });
        const listedCategoryIds = listedCategories.map(category => category._id);

        // Define a filter object to use in the query
        const filter = {
            categoryName: { $in: listedCategoryIds },
            isListed: true,
        };

        // Check if a category filter is provided in the request
        if (req.query.category) {
            if (!isValidQueryId(req.query.category)) {
                return res.render('./shop/pages/404')
            }
            filter.categoryName = req.query.category;
        }

        // Check if a search query is provided
        if (req.query.search) {
            filter.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
            ];
        }

        let sortCriteria = {};

        // Check for price sorting
        if (req.query.sort == 'lowtoHigh') {
            sortCriteria.salePrice = 1;
        } else if (req.query.sort === 'highToLow') {
            sortCriteria.salePrice = -1;
        }
        // Add the ability to filter by both category and price
        if (req.query.category && req.query.sort) {
            if (!isValidQueryId(req.query.category)) {
                return res.render('./shop/pages/404')
            }
            filter.categoryName = req.query.category;
            console.log(req.query.sort === 'lowtoHigh');

            if (req.query.sort) {
                sortCriteria.salePrice = 1;
            }
            if (req.query.sort === 'highToLow') {
                sortCriteria.salePrice = -1;
            }
        }
        // Find products based on the filter
        const findProducts = await Product.find(filter)
            .populate('images')
            .populate('categoryName')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort(sortCriteria);
        // Retrieve cart product IDs (as in your original code)
        let cartProductIds;
        let userWishlist;
        if (user) {
            if (user.cart || user.wishlist) {
                cartProductIds = user.cart.map(cartItem => cartItem.product.toString());
                userWishlist = user.wishlist;

            }
        } else {
            cartProductIds = null;
            userWishlist = null;
        }

        // Count the total number of matching products
        const count = await Product.find(filter).countDocuments();

        res.render('./shop/pages/shopping', {
            products: findProducts,
            category: listedCategories,
            cartProductIds,
            user,
            userWishlist,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
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
        res.render('./shop/pages/productDetail', { product: findProduct, products, cartProductIds, wishlist: user.wishlist })
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
        const user = req.user
        const userWishlist = await User.findById({ _id: user.id }).populate({
            path: 'wishlist',
            populate: {
                path: 'images',
            },
        });
        console.log('dsfs', userWishlist.wishlist);
        res.render('./shop/pages/wishlist', { wishlist: userWishlist.wishlist })
    } catch (error) {
        throw new Error(error)
    }
})

// add to wishlist --
const addTowishlist = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.id
        // checking if the product already existing in the wishlist
        const user = await User.findById(userId);
        if (user.wishlist.includes(productId)) {
            console.log('product found');
            await User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } })
            return res.json({ success: false, message: 'Product removed from wishlist' });
        }

        await User.findByIdAndUpdate(userId, { $push: { wishlist: productId } })
        res.json({ success: true, message: 'Product Added to wishlist' })
    } catch (error) {
        throw new Error(error)
    }
})

// Remove item from wishlist
const removeItemfromWishlist = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.id
        await User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } })
        res.redirect('/wishlist')
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
    editUserName,
    viewWalletHistory,
    shopping,
    viewProduct,
    wishlist,
    addTowishlist,
    removeItemfromWishlist,
    contact,
    aboutUs,
    forgotPasswordpage,
    sendResetLink,
    resetPassPage,
    resetPassword


}

