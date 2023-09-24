const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'muhammedparveshm@gmail.com', 
    pass: 'yhvo pmwe cbvl zgiy'
  }
});
module.exports = transporter;
