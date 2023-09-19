const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    
    categoryName:{
        type:String,
        required:true
        
    },
    list:{ 
        type:Boolean,
        default:false
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

//Export the model
module.exports = mongoose.model('Category', categorySchema);