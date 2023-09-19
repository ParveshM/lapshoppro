
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'muhammedparveshm@gmail.com', // Replace with your Gmail email
    pass: 'yhvo pmwe cbvl zgiy' // Replace with your Gmail password or an app-specific password
  }
});
module.exports = transporter;
