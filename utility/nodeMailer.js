const transporter = require('../config/emailSender'); // Import the Nodemailer transporter

function generateOTP() {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min) + min);
}

function sendOtp(email, otp) {
    console.log('otp inn sensd otp');
  const mailOptions = {
    from: 'muhammedparveshm@gmail.com',
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP for verification is: ${otp} `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending OTP:', error);
    } else {
      console.log('OTP sent:', info.response);
    }
  });
}
module.exports = {sendOtp,generateOTP}