const accountSid = 'AC212cbcabf978fd13bc1d0f8ac637e240';
const authToken = '683b1c7fe692bf2c367d89d338841475';
const client = require('twilio')(accountSid, authToken);

function generateOTP() {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min) + min);
}

const sendOtp = async (phone,generatedOtp) => {
    return new Promise((resolve, reject) => {
        const otp = generatedOtp
        client.messages
            .create({
                body: `Hello, this message is from LapshopPro. Your OTP for verification is ${otp}`,
                from: '+12566459637',
                to: '+91' + phone
            })
            .then(message => {
                console.log(message.sid);
                resolve(true); // Resolve the promise with true when OTP is sent successfully
            })
            .catch(error => {
                console.error(error);
                resolve(false); // Resolve the promise with false when OTP sending fails
            });
    });
}

module.exports = { sendOtp,generateOTP };


const nodmailer = require('nodemailer')