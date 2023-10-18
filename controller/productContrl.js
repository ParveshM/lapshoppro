const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Images = require('../models/imageModel')
const asyncHandler = require('express-async-handler')
const sharp = require('sharp')
const path = require('path')


// productManagement list the available products--
const productManagement = asyncHandler(async (req, res) => {
    try {
        const findProduct = await Product.find().populate('categoryName').populate("images");
        res.render('./admin/pages/products', { title: 'Products', productList: findProduct })
    } catch (error) {
        throw new Error(error)
    }
})

// addProduct Page---
const addProduct = asyncHandler(async (req, res) => {
    try {
        const category = await Category.find({ isListed: true })
        if (category) {
            res.render('./admin/pages/addProduct', { title: 'addProduct', catList: category })
        }
    } catch (error) {
        throw new Error(error)
    }
})

// inserting a product--- 
const insertProduct = asyncHandler(async (req, res) => {
    try {
        const imageUrls = []; 

        // Check if req.files exists and has images
        if (req.files && req.files.images.length > 0) {
            const images = req.files.images;

            for (const file of images) {
                try {
                    const imageBuffer = await sharp(file.path)
                        .resize(600, 800)
                        .toBuffer();
                    const thumbnailBuffer = await sharp(file.path)
                        .resize(300, 300)
                        .toBuffer();
                    const imageUrl = path.join("/admin/uploads", file.filename);
                    const thumbnailUrl = path.join("/admin/uploads", file.filename);
                    imageUrls.push({ imageUrl, thumbnailUrl });
                } catch (error) {
                    console.error("Error processing image:", error);
                }
            }

            const image = await Images.create(imageUrls);
            const imageId = image.map((image) => image._id).reverse()

            const newProduct = await Product.create({
                title: req.body.title,
                brand: req.body.brand,
                color: req.body.color,
                description: req.body.description,
                categoryName: req.body.categoryName,
                quantity: req.body.quantity,
                productPrice: req.body.productPrice,
                salePrice: req.body.salePrice,
                images: imageId
            })

            console.log('inserted', newProduct);
            if (newProduct) {
                res.redirect('/admin/products')
            }
        } else {
            res.status(400).json({ error: "Invalid input: No images provided" });
        }
    } catch (error) {
        throw new Error(error)
    }
});




// ListProduct---
const listProduct = asyncHandler(async (req, res) => {
    try {

        const id = req.params.id
        console.log(id);

        const listing = await Product.findByIdAndUpdate({ _id: id }, { $set: { isListed: true } })
        console.log(listing);
        res.redirect('/admin/products')

    } catch (error) {
        throw new Error(error)
    }
})

// unlist category---
const unListProduct = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id
        console.log(id);

        const listing = await Product.findByIdAndUpdate({ _id: id }, { $set: { isListed: false } })
        console.log(listing);
        res.redirect('/admin/products')

    } catch (error) {
        throw new Error(error)
    }

})

// editProductPage Loading---
const editProductPage = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id
        const category = await Category.find({ isListed: true })
        const productFound = await Product.findById(id).populate('categoryName').populate("images");
        console.log('images', productFound.images);
        console.log(productFound);
        if (productFound) {
            res.render('./admin/pages/editProduct', { title: 'editProduct', product: productFound, catList: category })
        }
    } catch (error) {
        throw new Error(error)
    }
})

const updateProduct = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        // console.log('id  body', req.body);
        const updateProduct = await Product.findByIdAndUpdate({ _id: id }, req.body);

        res.redirect('/admin/products');

    } catch (error) {
        throw new Error(error)
    }

})

// edit image function---
const editImage = asyncHandler(async (req, res) => {
    try {
        const imageId = req.params.id;
        const file = req.file;
        console.log('file', req.file);
        const imageBuffer = await sharp(file.path).resize(600, 800).toBuffer();
        const thumbnailBuffer = await sharp(file.path).resize(300, 300).toBuffer();
        const imageUrl = path.join("/admin/uploads", file.filename);
        const thumbnailUrl = path.join("/admin/uploads", file.filename);

        const images = await Images.findByIdAndUpdate(imageId, {
            imageUrl: imageUrl,
            thumbnailUrl: thumbnailUrl,
        });

        req.flash("success", "Image updated");
        res.redirect("back");
    } catch (error) {
        throw new Error(error);
    }
});
// Delete image using fetch
const deleteImage = asyncHandler(async (req, res) => {
    try {
        const imageId = req.params.id;
        // Optionally, you can also remove the image from your database
        await Images.findByIdAndRemove(imageId);
        const product = await Product.findOneAndUpdate(
            { images: imageId },
            { $pull: { images: imageId } },
            { new: true }
        );
        res.json({ message: "Images Removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


module.exports = {
    addProduct,
    insertProduct,
    productManagement,
    listProduct,
    unListProduct,
    editProductPage,
    updateProduct,
    editImage,
    deleteImage
} 