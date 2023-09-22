// not found--

const notFound = (req,res,next)=>{

    const error = new Error (`not Found : ${req.originalUrl}`)
   res.status(404)
    next(error);

}

// Error Handler---

const errorHandler = (err,req,res,next)=>{
    const statusCode = res.statusCode == 200 ? 500 : res.statusCode;
    res.status(statusCode)
    console.log(err);

}
module.exports = {notFound,errorHandler}