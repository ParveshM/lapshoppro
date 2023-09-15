const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    categoryName:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    list:{ 
        type:Boolean,
        default:false
    },
},{timestamps:true});

//Export the model
module.exports = mongoose.model('Category', categorySchema);