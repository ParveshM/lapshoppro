const transporter = require('../config/emailSender'); // Import the Nodemailer transporter


function forgetPassMail(email,resetUrl,userName) {
  const mailOptions = {
    from: 'muhammedparveshm@gmail.com',
    to: email,
    subject: 'Password reset mail',
    html : `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td>
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
                        <tr>
                            <td align="center" bgcolor="#007bff" style="padding: 40px 0;">
                                <h1 style="color: #ffffff;">Password Reset</h1>
                            </td>
                        </tr>
                        <tr>
                            <td bgcolor="#ffffff" style="padding: 40px 30px;">
                                <p>Dear ${userName},</p>
                                <p>We have received a request to reset your password. To reset your password, click the button below:</p>
                                <p style="text-align: center;">
                                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                                </p>
                                <p>If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.</p>
                                <p>Thank you for using our service!</p>
                            </td>
                        </tr>
                        <tr>
                            <td bgcolor="#f4f4f4" style="text-align: center; padding: 20px 0;">
                                <p>&copy; 2023 Craftopia</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `
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