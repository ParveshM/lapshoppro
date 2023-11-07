const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const Category = require('../models/categoryModel')
const graphHelper = require('../helpers/graphHelper')
// Loading loginPage--   
const loadLogin = asyncHandler(async (req, res) => {

    try {
        res.render('./admin/pages/login', { title: 'Login' })
    } catch (error) {
        throw new Error(error)
    }
})
// verifyAdmin--
const verifyAdmin = asyncHandler(async (req, res) => {
    try {
        const email = process.env.ADMIN_EMAIL
        const password = process.env.ADMIN_PASSWORD

        const emailCheck = req.body.email
        const user = await User.findOne({ email: emailCheck })

        if (user) {
            res.render('./admin/pages/login', { adminCheck: 'You are not an Admin', title: 'Login' })
        }
        if (req.body.email === email && req.body.password === password) {

            req.session.admin = email;
            res.redirect('/admin/dashboard')
        } else {
            res.render('./admin/pages/login', { adminCheck: 'Invalid Credentials', title: 'Login' })
        }

    } catch (error) {
        throw new Error(error)
    }
})


// loadDashboard---  
const loadDashboard = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find({ isListed: true }).count()
        const category = await Category.find({ isListed: true }).count()
        const orders = await Order.find().count()
        const latestOrders = await Order.find().populate('billingAddress').limit(5)
        const newUsers = await User.find({ isBlock: false }).sort({ createdAt: -1 }).limit(3)

        const total = await graphHelper.calculateRevenue();
        const [totalRevenue, slice] = [...total]

        const salesData = await graphHelper.calculateSalesData()
        const usersData = await graphHelper.countUsers()
        const productSold = await graphHelper.calculateProductSold()

        res.render('./admin/pages/index',
            {
                title: 'Dashboard',
                products,
                category,
                orders,
                totalRevenue,
                monthlyRevenue: slice,
                latestOrders,
                salesData,
                newUsers,
                usersData,
                productSold
            })
    } catch (error) {
        throw new Error(error)
    }
})

// UserManagement-- 
const userManagement = asyncHandler(async (req, res) => {

    try {
        const findUsers = await User.find();

        res.render('./admin/pages/userList', { users: findUsers, title: 'UserList' })
    } catch (error) {
        throw new Error(error)
    }
})
// searchUser
const searchUser = asyncHandler(async (req, res) => {

    try {

        const data = req.body.search
        const searching = await User.find({ userName: { $regex: data, $options: 'i' } });
        if (searching) {
            res.render('./admin/pages/userList', { users: searching, title: 'Search' })
        } else {
            res.render('./admin/pages/userList', { title: 'Search' })
        }


    } catch (error) {
        throw new Error(error)
    }
})
// Block a User
const blockUser = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        const finduser = await User.findByIdAndUpdate(id, { isBlock: true }, { new: true });
        console.log(finduser);
        res.redirect('/admin/user');
    } catch (error) {
        throw new Error(error)
    }
});

// Unblock a User
const unBlockUser = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        await User.findByIdAndUpdate(id, { isBlock: false }, { new: true });
        res.redirect('/admin/user');
    } catch (error) {
        throw new Error(error);
    }
});
// Loading sales report form page 
const salesReportPage = asyncHandler(async (req, res) => {
    try {
        res.render('./admin/pages/salesReport', { title: 'Sales Report' })
    } catch (error) {
        throw new Error(error)
    }
})
// Post method of sales report page
const generateSalesReport = asyncHandler(async (req, res) => {
    try {
        console.log('body', req.body);

        const fromDate = new Date(req.body.fromDate);
        const toDate = new Date(req.body.toDate);
        const matchedOrders = await Order.aggregate([
            {
                $match: {
                    orderDate: { $gte: fromDate, $lte: toDate },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userData',
                },
            },
            {
                $unwind: '$userData',
            },
            {
                $addFields: {
                    userName: '$userData.userName',
                },
            },
        ])
        const total = matchedOrders.reduce((prev, curr) => {
            return prev + curr.total;
        }, 0);

        res.json({ matchedOrders: matchedOrders, salesTotal: total })
    } catch (error) {
        throw new Error(error)
    }
})

// Admin Logout--
const logout = (req, res) => {
    try {
        req.session.admin = null;
        res.redirect('/admin')
    } catch (error) {
        throw new Error(error)
    }
}


module.exports = {
    loadLogin,
    verifyAdmin,
    loadDashboard,
    userManagement,
    searchUser,
    blockUser,
    unBlockUser,
    logout,
    salesReportPage,
    generateSalesReport
}
