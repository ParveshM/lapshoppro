const {roles} =require('../utility/constants')
const ensureAdmin = (req,res, next)=>{
    if(req.user.roles === roles.admin){
        next()
    }else{
        req.flash('You are not admin')
        res.redirect('/')
    }
}

module.exports = {ensureAdmin}