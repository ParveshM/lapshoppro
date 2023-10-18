const Coupon = require('../models/couponModel')
const asyncHandler = require('express-async-handler')


const listCoupons = asyncHandler(async (req, res) => {
    try {

        const listCoupons = await Coupon.find()

        res.render('./admin/pages/coupons', { title: 'Coupons', coupons: listCoupons });

    } catch (error) {
        throw new Error(error);
    }
});


// add coupon page--
const addCouponPage = asyncHandler(async (req, res) => {
    try {

        res.render('./admin/pages/addCoupon', { title: 'Add Coupon' });

    } catch (error) {
        throw new Error(error);
    }
});

// create new coupon---
const createCoupon = asyncHandler(async (req, res) => {
    try {

        console.log('coup body', req.body);

        const createCoupon = await Coupon.create(req.body)
        console.log('createda', createCoupon);

        res.redirect('/admin/coupons')
    } catch (error) {
        throw new Error(error);
    }
});

// Edit coupon form---
const editCouponPage = asyncHandler(async (req, res) => {
    try {
        const couponId = req.params.id

        const findCoupon = await Coupon.findById({ _id: couponId })
        if (findCoupon) {
            res.render('./admin/pages/editCoupon', { title: 'editCoupon', coupon: findCoupon });
        } else {
            return res.status(404).render('./admin/page404', { title: '404' })
        }

    } catch (error) {
        throw new Error(error);
    }
});

// edit coupon--
const editCoupon = asyncHandler(async (req, res) => {
    try {
        const couponId = req.params.id
        console.log('bidy', req.body);
        await Coupon.findByIdAndUpdate(couponId, req.body)
        res.redirect('/admin/coupons')
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    listCoupons,
    addCouponPage,
    createCoupon,
    editCouponPage,
    editCoupon
}