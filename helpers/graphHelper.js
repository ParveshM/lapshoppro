const User = require('../models/userModel')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const Category = require('../models/categoryModel')

// calculate total revenue and monthly revenu 
async function calculateRevenue() {
    const total = await Order.aggregate([
        {
            $unwind: '$items' // Deconstruct the items array
        },
        {
            $match: {
                'items.status': 'Delivered'
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$orderDate' },
                    month: { $month: '$orderDate' }
                },
                revenue: {
                    $sum: '$items.price'
                },
                processingFee: {
                    $sum: '$items.processingFee'
                }
            }
        },
        {
            $project: {
                _id: 0,
                year: '$_id.year',
                month: '$_id.month',
                totalRevenue: {
                    $subtract: ['$revenue', '$processingFee']
                }
            }
        },
        {
            $group: {
                _id: null,
                monthlyRevenue: {
                    $push: {
                        year: '$year',
                        month: '$month',
                        totalRevenue: '$totalRevenue'
                    }
                },
                totalRevenue: {
                    $sum: '$totalRevenue'
                }
            }
        }
    ])
    const monthlyRevenue = total[0].monthlyRevenue;
    const slice = monthlyRevenue.slice(-1)[0].totalRevenue
    const totalRevenue = total[0].totalRevenue;
    return [totalRevenue, slice]
}


// calculte salesData 
async function calculateSalesData() {
    const sale = await Order.aggregate([
        {
            $unwind: '$items' // Deconstruct the items array
        },
        {
            $match: {
                'items.status': 'Delivered'
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$orderDate' },
                    month: { $month: '$orderDate' }
                },
                count: {
                    $sum: '$items.price'
                }
            }
        },
        {
            $project: {
                _id: 0,
                year: '$_id.year',
                month: '$_id.month',
                count: 1
            }
        }
    ])
    return sale
}

// calculate Users over a period of time
async function countUsers() {

    const usersCount = await User.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: {
                '_id.year': 1,
                '_id.month': 1
            }
        }, {
            $project: {
                _id: 0,
                year: '$_id.year',
                month: '$_id.month',
                count: 1
            }
        }
    ])
    return usersCount
}

// count products sold 
async function calculateProductSold() {

    const productSold = await Product.aggregate([
        {
            $match: {
                'isListed': true
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: {
                    $sum: "$sold",
                },
            }
        },
        {
            $project: {
                _id: 0,
                year: '$_id.year',
                month: '$_id.month',
                count: 1
            }
        }

    ])
    return productSold
}

module.exports = {
    calculateRevenue,
    calculateSalesData,
    countUsers,
    calculateProductSold
}