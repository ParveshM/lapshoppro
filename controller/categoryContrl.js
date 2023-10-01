const category = require('../models/categoryModel')
const expressHandler = require('express-async-handler')


// category page-- 
const categoryManagement = expressHandler(async (req, res) => {
    try {
        const findCategory = await category.find()
        res.render('./admin/pages/categories', { catList: findCategory, title: 'Categories' })
    } catch (error) {
        throw new Error(error)
    }
})

// addCategory form---
const addCategory = expressHandler(async (req, res) => {
    try {
        res.render('./admin/pages/addCategory', { title: 'addCategory' })
    } catch (error) {
        throw new Error(error)
    }
})

// inserting  categories--
const insertCategory = expressHandler(async (req, res) => {
    try {

        const categoryName = req.body.addCategory;
        const regexCategoryName = new RegExp(`^${categoryName}$`, 'i');
        const findCat = await category.findOne({ categoryName: regexCategoryName });

        if (findCat) {
            const catCheck = `Category ${categoryName} Already existing`;
            res.render('./admin/pages/addCategory', { catCheck, title: 'addCategory' });
        } else {
            const result = new category({
                categoryName: categoryName,
            });
            await result.save();

            res.render('./admin/pages/addCategory', {
                message: `Category ${categoryName} added successfully`,
                title: 'addCategory',
            });
        }

    } catch (error) {
        throw new Error(error);
    }
});


// list category--
const list = expressHandler(async (req, res) => {
    try {

        const id = req.params.id
        console.log(id);

        const listing = await category.findByIdAndUpdate({ _id: id }, { $set: { isListed: true } })
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

        const listing = await category.findByIdAndUpdate({ _id: id }, { $set: { isListed: false } })
        console.log(listing);
        res.redirect('/admin/category')

    } catch (error) {
        throw new Error(error)
    }

})

// edit Category form --
const editCategory = expressHandler(async (req, res) => {

    try {
        const { id } = req.params
        const catName = await category.findById(id);
        if (catName) {
            res.render('./admin/pages/editCategory', { title: 'editCategory', values: catName });
        } else {
            console.log('error in rendering');
        }
    } catch (error) {
        throw new Error(error)
    }
})

// update Category name --
const updateCategory = expressHandler(async (req, res) => {
    try {
        const id = req.params.id
        const updatedName = req.body.updatedName
        console.log(updatedName);
        await category.findByIdAndUpdate(id, { $set: { categoryName: updatedName } })
        res.redirect('/admin/category')
    } catch (error) {
        throw new Error(error)
    }
})

// searchcCategory----
const searchCategory = expressHandler(async (req, res) => {
    console.log(req.body.search);
    try {
        const data = req.body.search
        const searching = await category.find({ categoryName: { $regex: data, $options: 'i' } });
        if (searching) {
            res.render('./admin/pages/categories', { title: 'Searching', catList: searching })

        } else {
            res.render('./admin/pages/categories', { title: 'Searching' })
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
    searchCategory

}