const express = require('express');
const path = require('path');
const logger = require('morgan');


const adminRoute = require('./routes/adminRoute');
const userRoute = require('./routes/userRoute');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));



// UserRoutes-----
app.use('/', userRoute);



app.listen(3000, () =>{
    console.log(`Server Started on http://localhost:3000`)})
module.exports = app;
