// Requiring modules---
const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session')
require('dotenv').config()


// importing files--
const expressLayouts = require('express-ejs-layouts')
const adminRoute = require('./routes/adminRoute');
const userRoute = require('./routes/userRoute');
const dataBase = require('./config/dataBase')
const {notFound, errorHandler} = require('./middlewares/errorHandler')

// using functions--
const app = express();
dataBase.dbConnect();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Session init
app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{httpOnly:true}
}))

// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
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
