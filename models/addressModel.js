const mongoose = require('mongoose'); 

const  addressSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    addressType:{
        type:String,
        required:true       
    },
    address:{
        type:String,
        required:true        
    },
    town:{
        type:String,
        required:true,
    },
    state:{
        type:String,
        required:true,
    },
    postCode:{
        type:Number,
        required:true,
    },
    phone:{
        type:Number,
        required:true,
    },
});

module.exports = mongoose.model('Address', addressSchema);