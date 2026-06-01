const nodemailer = require('nodemailer');

/** Gmail app passwords are 16 chars; Google shows them with spaces — strip spaces. */
const normalizeSmtpPass = (pass) => (pass ? String(pass).replace(/\s/g, '') : '');

const isEmailConfigured = () =>
  Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );

const isEmailDisabled = () => process.env.EMAIL_ENABLED === 'false';

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!isEmailConfigured() || isEmailDisabled()) return null;

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = port === 465;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST.trim(),
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: process.env.SMTP_USER.trim(),
      pass: normalizeSmtpPass(process.env.SMTP_PASS),
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
  });

  return transporter;
};

const getFromAddress = () => {
  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim();
  return from || 'no-reply@agriconnect.ai';
};

/**
 * Send email. Never throws — returns { ok, skipped?, error? } so auth/register still works.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (isEmailDisabled()) {
    console.log(`[email] Disabled (EMAIL_ENABLED=false) -> ${to}: ${subject}`);
    return { ok: false, skipped: true, reason: 'disabled' };
  }

  const transport = getTransporter();
  if (!transport) {
    console.log(`[email] Not configured -> ${to}: ${subject}`);
    if (text || html) {
      const preview = text || html.replace(/<[^>]+>/g, ' ').slice(0, 200);
      console.log(`[email] Body preview: ${preview}`);
    }
    return { ok: false, skipped: true, reason: 'not_configured' };
  }

  try {
    const info = await transport.sendMail({
      from: getFromAddress(),
      to,
      subject,
      html,
      text: text || undefined,
    });
    console.log(`[email] Sent to ${to} (${info.messageId})`);
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[email] Failed to send to ${to}:`, err.message);
    return { ok: false, error: err.message };
  }
};

/** Call once on server start — logs whether SMTP login works. */
const verifyEmailConnection = async () => {
  if (isEmailDisabled()) {
    console.log('[email] Skipped verification (EMAIL_ENABLED=false)');
    return { ok: false, skipped: true };
  }
  if (!isEmailConfigured()) {
    console.log('[email] SMTP not configured — emails log to console only');
    return { ok: false, skipped: true };
  }

  try {
    const transport = getTransporter();
    await transport.verify();
    console.log(`[email] SMTP ready (${process.env.SMTP_HOST}, user: ${process.env.SMTP_USER})`);
    return { ok: true };
  } catch (err) {
    console.error('[email] SMTP verification failed:', err.message);
    console.error(
      '[email] Gmail: use an App Password (2FA on), SMTP_PASS without spaces, SMTP_FROM = your Gmail address'
    );
    return { ok: false, error: err.message };
  }
};

const getEmailStatus = () => ({
  configured: isEmailConfigured(),
  disabled: isEmailDisabled(),
  host: process.env.SMTP_HOST || null,
  from: isEmailConfigured() ? getFromAddress() : null,
});

module.exports = {
  sendEmail,
  verifyEmailConnection,
  isEmailConfigured,
  getEmailStatus,
};
