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
      
        const email = 'admin@gmail.com'
        const password =  '1234'
            console.log(req.body); 
         if(req.body.email === email && req.body.password === password){
              
              req.session.admin = email; 
            res.render('./admin/pages/index',{title:'dashboard'})
         }else{
            res.render('./admin/pages/login', {adminCheck: 'Invalid Credentials',title:'verify'})
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
        console.log(findUsers,"haiii");

    
        res.render('./admin/pages/userList',{users:findUsers,title:'UserList'})
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
        res.redirect('/admin',{title:'logout'})
    } catch (error) {
        throw new Error(error)
    }
}


module.exports = {
    loadLogin,
    verifyAdmin,
    loadDashboard,
    userManagement,
    blockUser,
    unBlockUser,
    logout
}