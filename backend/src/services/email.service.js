import { getMailer } from "../config/mailer.js";

export async function sendResetEmail(toEmail, link) {
  const m = getMailer();
  if (!m) {
    console.log(`mailer misconfigured`);
    return;
  }
  try {
    await m.sendMail({
      from: `"${process.env.BREVO_FROM_NAME}" <${process.env.BREVO_FROM_EMAIL}>`,
      to: toEmail,
      subject: "Reset your NoteFlow password",
      html: `<p>Click <a href="${link}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    });
  } catch (e) {
    console.log(e);
  }
}
