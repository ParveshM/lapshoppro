const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const Product = require('../models/productModel')

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
    address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
    wishlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
}, { timestamps: true });


userSchema.pre('save', async function (next) {
    if (this.isNew) {
        const salt = bcrypt.genSaltSync(10);
        this.password = await bcrypt.hash(this.password, salt)
    }
    next()
})

userSchema.methods.isPasswordMatched = async function (enterdPassword) { // checking for matching password 
    return await bcrypt.compare(enterdPassword, this.password)
}

userSchema.methods.addToCart = async function (productId, quantity) {

    const product = await Product.findById(productId); // Find the product by its ID
    if (!product) {
        throw new Error('Product not found');
    }

    const existingCartItem = this.cart.find(item => item.product.equals(product._id)); // Checks if the product is already in cart

    if (existingCartItem) { // If the product already exists in the cart, update the quantity        
        existingCartItem.quantity += quantity;
    } else {
        this.cart.push({ product: product._id, quantity }); // If the product is not in the cart, add it as a new item
    }
    await this.save();
    return true; // Successfully added to cart
};

userSchema.methods.removeFromCart = function (productId) {
    this.cart = this.cart.filter(item => !item.product.equals(productId)); // Remove an item from the cart by product ID
    return this.save();
};

userSchema.methods.clearCart = function () {
    // Clear the entire cart
    this.cart = [];
    return this.save();
};


const User = mongoose.model('User', userSchema);
module.exports = User;
