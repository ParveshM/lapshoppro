
function ensureAuthenticated (req,res,next){
    if(req.isAuthenticated()){
        next()
    }else{
        res.redirect('/login')
    }
}


function ensureNotAuthenticated (req,res,next){
    if(req.isAuthenticated()){
        res.redirect('back')
        
    }else{
        next()
    }
}
module.exports = {ensureAuthenticated,ensureNotAuthenticated}