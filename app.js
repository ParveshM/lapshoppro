// Requiring modules---
const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session')
require('dotenv').config()
const passport = require('passport')
const connectFlash = require('connect-flash')
const connectMongo = require('connect-mongo')
const mongoose = require('mongoose')

// importing files--
const expressLayouts = require('express-ejs-layouts')
const adminRoute = require('./routes/adminRoute');
const userRoute = require('./routes/userRoute');
const dataBase = require('./config/dataBase')
const {notFound, errorHandler} = require('./middlewares/errorHandler');
const { log } = require('console');

// using functions--
const app = express();
dataBase.dbConnect();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mongoStore = new connectMongo(session)

// Session init
app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{httpOnly:true},
    store:new mongoStore({mongooseConnection: mongoose.connection})
}))
// using for sending message to ejs
app.use(connectFlash());
app.use((req,res,next)=>{
    res.locals.messages = req.flash()
    next();
})



// for passport authentication
app.use(passport.initialize())
app.use(passport.session())
require('./utility/passportAuth')

// for user session activity checking
app.use((req,res,next)=>{
    res.locals.user = req.user;
    next()
})



// view engine setup
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("public"));
app.use("/admin", express.static(__dirname + "public/admin"));
app.use("/shop", express.static(__dirname + "public/shop"));

app.use(expressLayouts)
app.set('layout', 'shop/layouts/user')
app.set('view engine', 'ejs');



// UserRoutes-----
app.use('/', userRoute);



// error Handling---
app.use(notFound);
app.use(errorHandler);




app.listen(3000, () => {
    console.log(`Server Started on http://localhost:${process.env.PORT}`)
})
module.exports = app;
