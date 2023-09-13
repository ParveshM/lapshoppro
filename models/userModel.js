const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const {role} = require('../utility/constants')
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
    mobile: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum :[role.user,role.admin],
        default:role.user
    },
    salt: String,
    isBlock: {
        type: Boolean,
        default: false
    },
    cart: {
        type: Array,
        default: []
    },
    address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
    wishlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
}, { timestamps: true });


userSchema.pre('save', async function (next) {
    if(this.isNew){
    const salt =  bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt)
    
    if(this.email === process.env.ADMIN_EMAIL){
        this.role = role.admin
    }
    }
    next()
})

userSchema.methods.isPasswordMatched = async function (enterdPassword) {
    return await bcrypt.compare(enterdPassword, this.password)
}


const User = mongoose.model('User', userSchema);
module.exports = User;
