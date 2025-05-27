// mailer.js
import nodemailer from 'nodemailer';
import 'dotenv/config';

export async function sendDigestEmail(subject, content) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO, // comma-separated list for multiple addresses
    subject,
    text: content
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.response}`);
  } catch (err) {
    console.error(`❌ Failed to send email: ${err.message}`);
  }
}