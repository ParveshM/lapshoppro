const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    
    categoryName:{
        type:String,
        required:true
        
    },
    isListed:{ 
        type:Boolean,
        default:true
    }
},{timestamps:true});

//Export the model
module.exports = mongoose.model('Category', categorySchema);