const transporter = require('../config/emailSender'); // Import the Nodemailer transporter


function forgetPassMail(email, token, id) {
  const mailOptions = {
    from: 'muhammedparveshm@gmail.com',
    to: email,
    subject: 'Password reset mail',
    html: `Please reset your password using this <a href="http://localhost:3000/resetPassword?token=${token}&id=${id}">Click here</a> link`,
  };


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending mail:', error);
    } else {
      console.log('mail sent:', info.response);
    }
  });
}

module.exports = { forgetPassMail }