const category = require('../models/categoryModel')
const expressHandler = require('express-async-handler')


// category page--
const categoryManagement = expressHandler(async (req, res) => {
    try {
        const findCategory = await category.find()
        res.render('./admin/pages/categories',{catList: findCategory,title: 'Categories'}) 
    } catch (error) {
        throw new Error(error)
    }
})

// addCategory form---
const addCategory = expressHandler(async (req, res) => {
    try {
        res.render('./admin/pages/addCategory',{title:'addCategory'})
    } catch (error) {
        throw new Error(error)
    }
})

// inserting  categories--
const insertCategory = expressHandler(async (req, res) => {
    try {

        const categoryName = req.body.addCategory 

        const findCat = await category.findOne({categoryName})
        if (findCat) {
            res.render('./admin/pages/addCategory',{catCheck: 'Category already existing',title:'addCategory'})

        } else {
            await category.create({
                categoryName

            });
            res.render('./admin/pages/addCategory',{message:`Category ${categoryName} added successfully`,title:'addCategory'})
        }
    } catch (error) {
        throw new Error(error)
    }
})

// list category--
const list = expressHandler(async (req, res) => {
    try {

        const id = req.params.id
        console.log(id);
        
        const listing = await category.findByIdAndUpdate({_id:id},{$set:{list:false}})
        console.log(listing);
        res.redirect('/admin/category')

    } catch (error) {
        throw new Error(error)
    }
})

// unlist category---
const unList = expressHandler(async (req, res) => {
    try {
        const id = req.params.id
        console.log(id);
        
        const listing = await category.findByIdAndUpdate({_id:id},{$set:{list:true}})
        console.log(listing);
        res.redirect('/admin/category')

    } catch (error) { 
        throw new Error(error)
    }

})

// edit Category form --
const editCategoryPage = expressHandler(async(req,res)=>{
  
    try {
        const {id} = req.params
        console.log(id,"kkk");
        // const catName = await category.findOne({_id:id});
        const catName = await category.findById(id);
        console.log(catName,"kakak");
        // if(catName){
       
       
        // }else{
        //     console.log('error in rendering');
        // }
        res.render('./admin/pages/editCategory',{title:'editCategory'});
    } catch (error) {
        throw new Error(error)
    }
})
// const editCategory = expressHandler(async(req,res)=>{
  
//     try {
       
//         res.render('./admin/pages/editCategory',{title:'editCategory'})
        
//     } catch (error) {
//         throw new Error(error)
//     }
// })

// update Category name --
const updateCategory = expressHandler(async(req,res)=>{
    try {
       const id = req.params.id
       const updatedName = req.body
        const updating = await category.findByIdAndUpdate({_id:id},{$set:{categoryName:updatedName}})
        res.render('./admin/pages/editCategory',{title:'editCategory'})
    } catch (error) {
        throw new Error(error)
    }
})


module.exports = {
    categoryManagement,
    addCategory,
    insertCategory,
    list,
    unList,
    editCategoryPage,
    updateCategory
}