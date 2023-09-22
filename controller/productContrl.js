const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const expressHandler = require('express-async-handler')
const sharp = require('sharp')
const path = require('path')

// productManagement--
const productManagement = expressHandler(async(req,res)=>{
    try {
       
        const findProduct = await Product.find().populate('categoryName');
                    res.render('./admin/pages/products',{title:'Products',productList:findProduct})

    } catch (error) {
        throw new Error(error)
    }
})

// addProduct Page---
const addProduct = expressHandler(async (req, res) => {
    try {
        const category = await Category.find({isListed: true})
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
 
        let primaryImage = []
        req.files.primaryImage.forEach((e) => {
            primaryImage.push({ 
                name: e.filename,  
                path: e.path 
            })
        });
        console.log(req.files?.primaryImage?.filename); 

    
        const secondaryImages = [];      /* Secondary images cropping area */
        for (const e of req.files.secondaryImage) {
            const croppedImage = path.join(__dirname, '../public/admin/uploads', `cropped_${e.filename}`);
        
            await sharp(e.path)
                .resize(600, 600, { fit: "cover" })
                .toFile(croppedImage);
        
            secondaryImages.push({
                name: `cropped_${e.filename}`, 
                path: croppedImage, 
            });
        }
        
        console.log('secondaryImages after crop',secondaryImages);


        const saving = new Product({
            title: req.body.title,
            brand: req.body.brand,
            color:req.body.color,
            description: req.body.description, 
            categoryName: req.body.categoryName,
            quantity: req.body.quantity,
            productPrice: req.body.productPrice,
            salePrice: req.body.salePrice,             
            primaryImage: primaryImage,
            secondaryImages: secondaryImages,
        })

        const inserted = await saving.save()
        console.log(inserted);
        if(inserted){

            res.redirect('/admin/products')
        }
    } catch (error) {
        throw new Error(error)
    }
})

// ListProduct---
const listProduct = expressHandler(async (req, res) => {
    try {

        const id = req.params.id
        console.log(id);
        
        const listing = await Product.findByIdAndUpdate({_id:id},{$set:{isListed:true}})
        console.log(listing);
        res.redirect('/admin/products')

    } catch (error) {
        throw new Error(error)
    }
}) 

// unlist category---
const unListProduct = expressHandler(async (req, res) => {
    try {
        const id = req.params.id
        console.log(id);
        
        const listing = await Product.findByIdAndUpdate({_id:id},{$set:{isListed:false}})
        console.log(listing);
        res.redirect('/admin/products')

    } catch (error) { 
        throw new Error(error)
    }

})

// editProductPage Loading---
const editProductPage = expressHandler(async (req, res) => { 
    try {
        const id = req.params.id
        console.log(id); 
        const category = await Category.find({ isList: true })
        const productFound = await Product.findById(id).populate('categoryName').exec() 
        console.log(productFound);
       if(productFound){
        res.render('./admin/pages/editProduct',{title:'editProduct',product:productFound,catList:category})
       }

    } catch (error) { 
        throw new Error(error)
    }
})
const updateProduct = expressHandler(async (req, res) => {
    try { 

const id = req.params.id; 
const existingProduct = await Product.findById(id);
const { title, description, brand, color, categoryName, quantity, productPrice, salePrice } = req.body;


let primaryImage;
if (req.files.primaryImage) {
    const primaryImageFile = req.files.primaryImage[0];
    primaryImage = {
        name: primaryImageFile.filename,
        path: primaryImageFile.path,
    };
} else {
    // No new primary image uploaded, retain the existing one
    primaryImage = existingProduct.primaryImage[0];
}

const secondaryImageID = req.body.idSecondaryImage; /* hidden input image id */

const dbImage = existingProduct.secondaryImages;

 


let secondaryImages =  req.files.secondaryImage;


if (secondaryImages) {
    for (let i = 0; i < secondaryImages.length; i++) {
       if(secondaryImageID[i] == dbImage[i]._id){
        dbImage[i].name = secondaryImages[i].filename;
        dbImage[i].path = secondaryImages[i].path;
       }
        
    }   
}
const updatedProduct = await Product.findByIdAndUpdate(
    id,
    {
        title,
        description,
        brand,
        color,
        categoryName,
        quantity,
        productPrice,
        salePrice,
        primaryImage: [primaryImage],
       
        });
        console.log('updated product',updatedProduct);
res.redirect('/admin/products');


    } catch (error) { 
        throw new Error(error)
    }

})

module.exports = {
    addProduct,
    insertProduct,
    productManagement,
    listProduct,
    unListProduct,
    editProductPage,
    updateProduct
} 