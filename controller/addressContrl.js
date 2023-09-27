const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')

// loading address page---
const loadAddressPage = asyncHandler(async (req, res) => {
    try {       
        res.render('./shop/pages/addAddress')
    } catch (error) {
      throw new Error(error)
    }
})
// insert-Address
const insertAddress = asyncHandler(async(req, res) => {
    try {       
        
    } catch (error) {
      throw new Error(error)
    }
})

module.exports = {
    loadAddressPage,
    insertAddress
}