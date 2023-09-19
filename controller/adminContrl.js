const expressHandler = require('express-async-handler')
const User = require('../models/userModel')

// Loading loginPage--   
const loadLogin = expressHandler(async(req,res)=>{

    try {
        res.render('./admin/pages/login',{title:'Login'})
    } catch (error) {
        throw new Error(error)
    }
})
// verifyAdmin--
const verifyAdmin = expressHandler(async(req,res)=>{

    try {
      
        const email = process.env.ADMIN_EMAIL
        const password =   process.env.ADMIN_PASSWORD
          
            const emailCheck = req.body.email
           const user = await User.findOne({email:emailCheck})

            if(user){
                     res.render('./admin/pages/login',{adminCheck:'You are not an Admin',title:'Login'})
            }
         if(email === email && req.body.password === password){
              
              req.session.admin = email; 
            res.render('./admin/pages/index',{title:'dashboard'})
         }else{
            res.render('./admin/pages/login', {adminCheck: 'Invalid Credentials',title:'Login'})
         }

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

// UserManagement-- 
const userManagement = expressHandler(async(req,res)=>{

    try {
     
        const findUsers = await User.find();
            
        res.render('./admin/pages/userList',{users:findUsers,title:'UserList'})
    } catch (error) {
        throw new Error(error) 
    }
}) 
// searchUser
const searchUser = expressHandler(async(req,res)=>{

    try {
     
        const  data = req.body.search
        const searching = await User.find({userName:{$regex: data , $options: 'i' }});
        if(searching){
             res.render('./admin/pages/userList',{users:searching,title:'Search'})
        }else{
            res.render('./admin/pages/userList',{title:'Search'})
        }
            
       
    } catch (error) {
        throw new Error(error) 
    }
}) 
// Block a User
const blockUser = expressHandler(async (req, res) => {
    try {
        const id = req.params.id;
     const finduser =    await User.findByIdAndUpdate(id, { isBlock: true }, { new: true });
         console.log(finduser);
        res.redirect('/admin/user');
    } catch (error) {
        throw new Error(error)    
    }
});

// Unblock a User
const unBlockUser = expressHandler(async (req, res) => {
    try { 
        const id = req.params.id;
         await User.findByIdAndUpdate(id, { isBlock: false }, { new: true });
        res.redirect('/admin/user');
    } catch (error) {
        throw new Error(error);
    }
});

// Admin Logout--
const logout = (req, res)=>{
    try {
        req.session.admin = null;
        res.redirect('/admin')
    } catch (error) {
        throw new Error(error)
    }
}


module.exports = {
    loadLogin,
    verifyAdmin,
    loadDashboard,
    userManagement,
    searchUser,
    blockUser,
    unBlockUser,
    logout
}