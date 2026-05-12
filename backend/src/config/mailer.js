import nodemailer from "nodemailer";

let transporter = null;

export function getMailer() {
  if (transporter) return transporter;

  if (!process.env.BREVO_SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: Number(process.env.BREVO_SMTP_PORT) || 587,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
    secure: false,
    requireTLS: true,
    connectionTimeout: 20000, // 20 seconds
    greetingTimeout: 20000,
    socketTimeout: 20000,
  });

  return transporter;
}
