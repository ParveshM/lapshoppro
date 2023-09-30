const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    items: [
        {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price:{
            type:Number,
            required:true
        }
        }
    ],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderId: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now(),
    },
    estimatedDelivery: {
        type: Date,
        required: true,
        default: function () {
            const deliveryDate = new Date(this.orderDate);
            deliveryDate.setDate(this.orderDate.getDate() + 5);
            return deliveryDate;
        },
    },
    shippedDate: {
        type: Date,
        default: Date,
    },
    deliveredDate: {
        type: Date,
        default: Date,
    },
    billingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    discount: Number,
    subtotal: Number,
    taxAmount: Number,
    total: Number,
});


module.exports = mongoose.model('Order', orderSchema);;
