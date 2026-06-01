/**
 * Test SMTP from your machine:
 *   cd backend
 *   node scripts/test-email.js your-email@gmail.com
 */
require('dotenv').config();
const { verifyEmailConnection, sendEmail } = require('../src/services/emailService');

const to = process.argv[2] || process.env.SMTP_USER;

(async () => {
  if (!to) {
    console.error('Usage: node scripts/test-email.js recipient@email.com');
    process.exit(1);
  }

  console.log('Checking SMTP connection...');
  const check = await verifyEmailConnection();
  if (!check.ok && !check.skipped) {
    process.exit(1);
  }
  if (check.skipped) {
    console.log('Set SMTP_HOST, SMTP_USER, SMTP_PASS in backend/.env');
    process.exit(1);
  }

  console.log(`Sending test email to ${to}...`);
  const result = await sendEmail({
    to,
    subject: 'AgriConnect AI — SMTP test',
    text: 'If you received this, email is working.',
    html: '<p>If you received this, <strong>email is working</strong>.</p>',
  });

  if (result.ok) {
    console.log('Success! Check inbox (and spam folder).');
    process.exit(0);
  }
  console.error('Send failed:', result.error || result.reason);
  process.exit(1);
})();
