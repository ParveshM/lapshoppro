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
const nocache = require('nocache')
const expressLayouts = require('express-ejs-layouts')

// importing files--
const adminRoute = require('./routes/adminRoute')
const userRoute = require('./routes/userRoute');
const dataBase = require('./config/dataBase')
const { notFound, errorHandler } = require('./middlewares/errorHandler');


// using functions--
const app = express();
dataBase.dbConnect();


app.use(nocache())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mongoStore = new connectMongo(session)

// Session init
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 3600000 // Set the expiration time to 1 hour (in milliseconds)
    },
    store: new mongoStore({ mongooseConnection: mongoose.connection })
}))

// using for sending message to ejs
app.use(connectFlash());
app.use((req, res, next) => {
    res.locals.messages = req.flash()
    next();
})



// for passport authentication
app.use(passport.initialize())
app.use(passport.session())
require('./utility/passportAuth')

// for user session activity checking
app.use((req, res, next) => {
    res.locals.user = req.user;
    next()
})



// view engine setup
app.use(express.static("public"));
app.use("/admin", express.static(__dirname + "public/admin"));

app.use(expressLayouts)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// UserRoutes-----
app.use('/admin', adminRoute)
app.use('/', userRoute);
// AdminRoutes---



// error Handling---
app.use(notFound);
app.use(errorHandler);



// server setup--
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server Started on http://localhost:${process.env.PORT}`)
})
module.exports = app;
