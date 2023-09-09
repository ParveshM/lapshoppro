const userRoute = require('../routes/userRoute')


const loadLandingPage = (req,res)=>{
    console.log('req recieved');
    res.render('./shop/pages/index')
}
  
module.exports ={loadLandingPage}