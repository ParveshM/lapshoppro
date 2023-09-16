const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const expressHandler = require('express-async-handler')


// addProduct Page---
const addProduct = expressHandler(async (req, res) => {
    try {
        const category = await Category.find({ isDeleted: false, list: false })
        if (category) {
            res.render('./admin/pages/addProduct', { title: 'addProduct', catList: category })
        }
    } catch (error) {
        throw new Error(error)
    }
}) 

// inserting a product--- 
const insertProduct = expressHandler(async (req, res) => {
    try {
          const newProduct = await Product.create(req.body);
        if (newProduct) {
            const category = await Category.find({ isDeleted: false, list: false })

            const message = 'Product Added Successfully'
            res.render('./admin/pages/addProduct', { title: 'AddProduct', status: message ,catList:category})
        }
    } catch (error) {
        throw new Error(error)
    }
})


module.exports = {
    addProduct,
    insertProduct
} 