const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: Number,
            price: {
                type: Number,
                required: true
            },
            status: {
                type: String,
                enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
                default: 'Pending',
            },
        }
    ],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderId: {
        type: String,
        default: function () {
            return `ORD-${new Date().getTime().toString()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        },
        unique: true,
    },
    orderDate: {
        type: Date,
        default: Date.now()
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
    paymentMethod: {
        type: String,
        required: true,
    },
    paymentStatus: {
        type: String,
       default:'Pending'
    },
    discount: Number,
    processingFee: Number,
    subtotal: Number,
    total: Number,
});


module.exports = mongoose.model('Order', orderSchema);;
