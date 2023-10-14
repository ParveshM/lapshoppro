const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    discountType: {
        type: String,
        default: 'Percentage'
    },
    minimumPurchase: {
        type: Number,
    },
    maximumPurchase: {
        type: Number,
    },
    discountAmount: {
        type: Number,
        required: true,
    },
    maximumUses: {
        type: Number,
        required:true
    },
    expirationDate: {
        type: Date,
        require:true
    },
    description: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Coupon', couponSchema);
