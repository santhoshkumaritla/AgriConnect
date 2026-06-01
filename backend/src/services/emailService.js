const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.SMTP_HOST) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`Email placeholder -> ${to}: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@agriconnect.ai',
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail };
