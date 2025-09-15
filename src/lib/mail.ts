// lib/mail.ts
import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
  NEXT_PUBLIC_BASE_URL,
} = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !FROM_EMAIL || !NEXT_PUBLIC_BASE_URL) {
  // don't crash at import time — but warn
  console.warn('Mail environment variables appear to be missing.');
}

const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: SMTP_SECURE === 'true' || SMTP_SECURE === '1',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function sendMagicLink(email: string, token: string) {
  const url = `${NEXT_PUBLIC_BASE_URL}/api/auth/verify?token=${encodeURIComponent(
    token
  )}&email=${encodeURIComponent(email)}`;

  const html = `
    <p>Hello,</p>
    <p>Click the link below to sign in — the link expires in 15 minutes.</p>
    <p><a href="${url}">Sign in</a></p>
    <p>Or paste this in your browser:</p>
    <pre>${url}</pre>
  `;

  const info = await transport.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: 'Your magic sign-in link',
    html,
    text: `Sign in: ${url}`,
  });

  return info;
}
