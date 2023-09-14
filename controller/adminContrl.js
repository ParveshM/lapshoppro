const admin = require('../models/userModel')
const expressHandler = require('express-async-handler')


// Loading loginPage--
const loadLogin = expressHandler(async(req,res)=>{

    try {
        res.render('./admin/pages/login',{title:'Login'})
    } catch (error) {
        throw new Error(error)
    }
})
// loadDashboard---
const loadDashboard = expressHandler(async(req,res)=>{

    try {
        res.render('./admin/pages/index',{title:'Dashboard'})
    } catch (error) {
        throw new Error(error)
    }
})

const logout = (req, res)=>{
    try {
        req.logout(function(err) {

            if (err) {
                  next(err);
                 }})
        res.redirect('/admin')
    } catch (error) {
        throw new Error(error)
    }
}


module.exports = {
    loadLogin,
    loadDashboard,
    logout
}