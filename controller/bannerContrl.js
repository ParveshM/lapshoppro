const expressHandler = require('express-async-handler')
const path = require('path')
const fs = require('fs')

const Product = require('../models/productModel')
const Banner = require('../models/bannerModel')
const { log } = require('console')

// list banners--
const listBanners = expressHandler(async (req, res) => {
    try {

        const listBanners = await Banner.find()
        res.render('./admin/pages/banners', { title: 'Banner', banners: listBanners })
    } catch (error) {
        throw new Error(error)
    }
})

const addBannerPage = expressHandler(async (req, res) => {
    try {
        const findProducts = await Product.find({ isListed: true })
        res.render('./admin/pages/addBanner', { title: 'Add Banner', Products: findProducts })
    } catch (error) {
        throw new Error(error)
    }
})
const createBanner = expressHandler(async (req, res) => {

    try {
        console.log('body', req.body);
        let bannerImage = [];
        if (req.file) {
            bannerImage.push({
                name: req.file.filename,
                path: req.file.path
            })

        }
        const newBanner = {
            bannerImage: bannerImage,
            productUrl: req.body.productUrl,
            title: req.body.title,
            description: req.body.description,
        }


        const create = await Banner.create(newBanner)
        console.log('create', create);
        res.redirect('/admin/banners')


    } catch (error) {
        throw new Error(error)
    }
})

const updateBannerStatus = expressHandler(async (req, res) => {
    try {

        const bannerId = req.params.id;
        const status = req.body.isActive
        const findBanner = await Banner.findByIdAndUpdate(bannerId, { isActive: status })
        res.json({ success: true})
    } catch (error) {
        throw new Error(error)
    }
})

module.exports = {
    addBannerPage,
    createBanner,
    listBanners,
    updateBannerStatus

}