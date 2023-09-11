const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
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
        default:'user'
    },
    salt:String,
    address: [],
    cart: [],
    wishlist: []
}, { timestamps: true });


userSchema.pre('save',async function(next){
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password,salt)
    next()
})

userSchema.methods.isPasswordMatched = async function(enterdPassword){
  return await bcrypt.compare(enterdPassword,this.password)
}


const User = mongoose.model('User', userSchema);
module.exports = User;
