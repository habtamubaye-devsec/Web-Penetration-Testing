const nodemailer = require('nodemailer');

const isProduction = () => String(process.env.NODE_ENV || '').toLowerCase() === 'production';

const getEmailMode = () => String(process.env.EMAIL_MODE || '').trim().toLowerCase();

const getTransportOptions = () => {
  const emailUser = String(process.env.EMAIL_USER || '').trim();
  const emailPass = String(process.env.EMAIL_PASS || '').replace(/\s/g, '');

  if (!emailUser || !emailPass) {
    const err = new Error('Email service is not configured on the server.');
    err.code = 'EMAIL_NOT_CONFIGURED';
    throw err;
  }

  const smtpHost = String(process.env.EMAIL_HOST || 'smtp.gmail.com').trim();
  const smtpPort = Number(process.env.EMAIL_PORT || 587);
  const smtpSecure = String(process.env.EMAIL_SECURE || '').toLowerCase() === 'true';

  return {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    requireTLS: !smtpSecure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  };
};

/**
 * @param {{to: string, subject: string, text?: string, html?: string, from?: string, attachments?: any[]}} payload
 */
const sendEmail = async (payload) => {
  const mode = getEmailMode();
  const dev = !isProduction();

  if (dev && (mode === 'log' || mode === 'console')) {
    return { mode: 'log', messageId: null };
  }

  const transportOptions = getTransportOptions();
  const transporter = nodemailer.createTransport(transportOptions);

  const from = payload.from || process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const mailOptions = {
    from,
    to: payload.to,
    subject: payload.subject,
    ...(payload.text ? { text: payload.text } : {}),
    ...(payload.html ? { html: payload.html } : {}),
    ...(payload.attachments ? { attachments: payload.attachments } : {}),
  };

  const info = await transporter.sendMail(mailOptions);
  return { mode: 'smtp', messageId: info?.messageId || null };
};

module.exports = sendEmail;
module.exports.sendEmail = sendEmail;
module.exports.getEmailMode = getEmailMode;
module.exports.getTransportOptions = getTransportOptions;
