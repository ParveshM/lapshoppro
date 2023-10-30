// DataBase connnection settings---
const mongoose = require('mongoose');
require('dotenv').config();
const asyncHandler = require("express-async-handler");


const dbConnect = asyncHandler(async () => {
    try {
        mongoose.connect(process.env.MONGO_URL);
        console.log("Database Connected Successfully");
    } catch (error) {
        throw new Error();
    }
});

module.exports = { dbConnect };

