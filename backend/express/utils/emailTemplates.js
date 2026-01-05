const fs = require('fs');
const path = require('path');

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const stripTrailingSlash = (url) => String(url || '').replace(/\/+$/, '');

const getAppName = () => String(process.env.APP_NAME || 'AI Enhanced Penetration Testing').trim();

const getClientOrigin = () => {
  const clientUrl = String(process.env.CLIENT_URL || 'http://localhost:8080').trim();
  return stripTrailingSlash(clientUrl);
};

const getLogoUrl = () => {
  // Prefer using the frontend favicon from the same origin as the reset link.
  // If your frontend serves a different logo path, set EMAIL_LOGO_URL.
  const envLogo = String(process.env.EMAIL_LOGO_URL || '').trim();
  if (envLogo) return envLogo;

  // Default: frontend/web/public/favicon.ico served by CLIENT_URL.
  return `${getClientOrigin()}/favicon.ico`;
};

const getLogoMode = () => {
  const mode = String(process.env.EMAIL_LOGO_MODE || '').trim().toLowerCase();
  // Default to cid so the logo works even if the email client blocks remote images.
  return mode === 'url' ? 'url' : 'cid';
};

const getDefaultFaviconPath = () => {
  // Use a PNG for best email-client compatibility.
  // This file exists in the repo under backend/express/utils.
  return path.resolve(__dirname, './images (1).png');
};

const getLogoConfig = () => {
  const mode = getLogoMode();
  if (mode === 'url') {
    return { src: getLogoUrl(), attachments: [] };
  }

  const cid = 'app-logo';
  const logoPath = String(process.env.EMAIL_LOGO_PATH || '').trim() || getDefaultFaviconPath();

  try {
    const content = fs.readFileSync(logoPath);
    return {
      src: `cid:${cid}`,
      attachments: [
        {
          filename: path.basename(logoPath) || 'favicon.ico',
          content,
          cid,
        },
      ],
    };
  } catch {
    // If the file isn't present on the server, fall back to URL.
    return { src: getLogoUrl(), attachments: [] };
  }
};

/**
 * Base HTML wrapper for all emails.
 * Uses conservative HTML/CSS for compatibility with common email clients.
 */
const buildEmailLayout = ({
  subject,
  preheader,
  headline,
  bodyHtml,
  cta,
  footerNote,
}) => {
  const appName = getAppName();
  const safeSubject = escapeHtml(subject || appName);
  const safePreheader = escapeHtml(preheader || '');
  const safeHeadline = escapeHtml(headline || safeSubject);
  const logo = getLogoConfig();

  const brandBlue = '#3b82f6';
  const brandBlueDark = '#2563eb';
  const ink = '#0f172a';
  const text = '#334155';
  const muted = '#64748b';
  const bg = '#f6f7fb';
  const cardBorder = '#e5e7eb';

  const ctaHtml = cta?.url
    ? `
      <tr>
        <td align="center" style="padding: 18px 0 4px 0;">
          <a href="${escapeHtml(cta.url)}"
             style="background:${brandBlue};border-radius:12px;color:#ffffff;display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:800;letter-spacing:0.2px;line-height:46px;text-align:center;text-decoration:none;min-width:220px;padding:0 18px;box-shadow:0 8px 18px rgba(59,130,246,0.28);">
            ${escapeHtml(cta.label || 'Open')}
          </a>
        </td>
      </tr>
      ${cta?.hint ? `
        <tr>
          <td style="padding: 10px 0 0 0; color:${muted}; font-family:Arial,Helvetica,sans-serif; font-size:12px; line-height:18px;">
            ${escapeHtml(cta.hint)}
          </td>
        </tr>
      ` : ''}
    `
    : '';

  const footerHtml = footerNote
    ? `<p style="margin:0;color:${muted};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;">${escapeHtml(footerNote)}</p>`
    : '';

  return { html: `<!doctype html
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background:${bg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${safePreheader}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse; background:${bg};">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="width:600px; max-width:600px; border-collapse:collapse;">
          <tr>
            <td style="padding:0 0 14px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="background: linear-gradient(135deg, ${brandBlue} 0%, ${brandBlueDark} 100%); border-radius:16px; padding: 14px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                      <tr>
                        <td style="vertical-align:middle;">
                          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                            <tr>
                              <td style="vertical-align:middle; padding-right: 10px;">
                                <img src="${escapeHtml(logo.src)}" width="34" height="34" alt="${escapeHtml(appName)}" style="display:block;border:0;outline:none;text-decoration:none;border-radius:8px;background:#ffffff;" />
                              </td>
                              <td style="vertical-align:middle;">
                                <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:800;color:#ffffff;">${escapeHtml(appName)}</div>
                                <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(255,255,255,0.86);">Security scanning platform</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td align="right" style="vertical-align:middle;">
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(255,255,255,0.86);">${safeSubject}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:#ffffff;border:1px solid ${cardBorder};border-radius:16px; padding: 22px 22px 18px 22px; box-shadow: 0 12px 30px rgba(15,23,42,0.06);">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:900;color:${ink};line-height:24px;">
                    ${safeHeadline}
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 10px; font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${text};line-height:20px;">
                    ${bodyHtml || ''}
                  </td>
                </tr>
                ${ctaHtml}
                <tr>
                  <td style="padding-top: 16px; border-top:1px solid #eef2f7;">
                    ${footerHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 14px 6px 0 6px; text-align:center;">
              <p style="margin:0;color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;">
                If you didn’t request this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`, attachments: logo.attachments };
};

const buildPasswordResetEmail = ({ resetUrl }) => {
  const appName = getAppName();
  const safeUrl = escapeHtml(resetUrl);

  const bodyHtml = `
    <p style="margin:0 0 10px 0;">
      We received a request to reset your password for <strong>${escapeHtml(appName)}</strong>.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse; margin: 8px 0 6px 0;">
      <tr>
        <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 12px;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#0f172a;line-height:18px;font-weight:700;">Quick checklist</div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#475569;line-height:18px;margin-top:6px;">
            • This link expires in <strong>1 hour</strong><br/>
            • Only reset if you requested it<br/>
            • Use a strong password (12+ characters)
          </div>
        </td>
      </tr>
    </table>
    <p style="margin:10px 0 0 0; color:#64748b; font-size:12px; line-height:18px;">
      If the button doesn’t work, copy and paste this URL into your browser:
      <br />
      <a href="${safeUrl}" style="color:#2563eb; word-break:break-all;">${safeUrl}</a>
    </p>
  `;

  const text = [
    `Password reset requested for ${appName}.`,
    ``,
    `Reset your password (expires in 1 hour):`,
    `${resetUrl}`,
    ``,
    `If you did not request this, you can ignore this email.`,
  ].join('\n');

  const tpl = buildEmailLayout({
    subject: 'Password Reset Request',
    preheader: 'Reset your password securely (expires in 1 hour).',
    headline: 'Reset your password',
    bodyHtml,
    cta: {
      label: 'Reset Password',
      url: resetUrl,
      hint: 'Link expires in 1 hour.',
    },
    footerNote: 'For your security, never share this link with anyone.',
  });

  return { subject: 'Password Reset Request', html: tpl.html, text, attachments: tpl.attachments };
};

module.exports = {
  buildEmailLayout,
  buildPasswordResetEmail,
  getAppName,
  getClientOrigin,
  getLogoUrl,
};
