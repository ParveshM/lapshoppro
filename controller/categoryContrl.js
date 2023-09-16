const category = require('../models/categoryModel')
const expressHandler = require('express-async-handler')


// category page-- 
const categoryManagement = expressHandler(async (req, res) => {
    try {
        const findCategory = await category.find({isDeleted:false})
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
            const result = await category.findOneAndUpdate(
                { categoryName },
                {
                    $set: {
                        categoryName,
                        isDeleted: false, /** updated the isDeleted field to false when the document already existing **/
                    },
                },
                { upsert: true} // Upsert 
            );
            
            console.log(result);
            res.render('./admin/pages/addCategory',{message:`Category ${categoryName} added successfully`,title:'addCategory'})
        
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
const editCategory = expressHandler(async(req,res)=>{
  
    try {
        const {id} = req.params
        const catName = await category.findById(id);
        if(catName){
            res.render('./admin/pages/editCategory',{title:'editCategory',values:catName});    
        }else{
            console.log('error in rendering');
        }
    } catch (error) {
        throw new Error(error)   
    }
})
 
// update Category name --
const updateCategory = expressHandler(async(req,res)=>{
    try {
       const id = req.params.id
       const updatedName = req.body.updatedName
       console.log(updatedName);
       await category.findByIdAndUpdate(id,{$set:{categoryName:updatedName}})
        res.redirect('/admin/category')
    } catch (error) {
        throw new Error(error)
    }
})

// deleteCategory----
const deleteCategory = expressHandler(async(req,res)=>{
   console.log('got the request ',req.params.id);
    try {
        const {id} = req.params
        const deleted = await category.findByIdAndUpdate(id,{$set:{isDeleted:true}});
         if(deleted){
            res.redirect('/admin/category')

         }else{
            console.log('error in redirecting');
         }
       
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
    editCategory,
    updateCategory, 
    deleteCategory
}