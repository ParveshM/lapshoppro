const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Product = require('../models/productModel');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    salt: String,
    isBlock: {
        type: Boolean,
        default: false
    },
    cart: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
    }],
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
    coupons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }],
    referralCode:{
        type:String,
        unique:true
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
}, { timestamps: true });


userSchema.pre('save', async function (next) {
    if (this.isNew) {
        const salt = bcrypt.genSaltSync(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    // Checking for matching password
    return await bcrypt.compare(enteredPassword, this.password);
};

// resetPassword
userSchema.methods.createResetPasswordToken = async function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};


userSchema.methods.addToCart = async function (productId, quantity) {
    const product = await Product.findById(productId); // Find the product by its ID
    if (!product) {
        throw new Error('Product not found');
    }
    if (quantity > product.quantity) {

        throw new Error('Not enough stock available');
    }

    const existingCartItem = this.cart.find(item => item.product.equals(product._id));

    if (existingCartItem) {
        // If the product already exists in the cart, update the quantity
        existingCartItem.quantity += quantity; // Increment the quantity
    } else {
        // this.cart.push({ product: product._id, quantity }); // If not in the cart, add as a new item
        this.cart.push({ product: product._id, quantity: 1 });
    }

    await this.save();
    return true; // Successfully updated cart
};


userSchema.methods.removeFromCart = function (productId) {
    // Remove an item from the cart by product ID
    this.cart = this.cart.filter(item => !item.product.equals(productId));
    return this.save();
};

userSchema.methods.clearCart = function () {
    // Clear the entire cart
    this.cart = [];
    return this.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;
