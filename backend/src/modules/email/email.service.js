export async function sendResetEmail(to, link) {
  return send({
    to,
    subject: "Password Reset Request",
    text: `Click here to reset your password: ${link}`,
    html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`,
  });
}

export async function sendWelcomeEmail(to, name) {
  return send({
    to,
    subject: "Welcome to NoteFlow",
    text: `Welcome ${name}!`,
    html: `<p>Welcome ${name}!</p>`,
  });
}

export async function send({ to, subject, text, html }) {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_FROM_NAME,
          email: process.env.BREVO_FROM_EMAIL,
        },
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: html || `<p>${text}</p>`,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error("Something went wrong");
    }

    console.log("Email sent:", data.messageId);
    return data;
  } catch (err) {
    console.error("Email error:", err.message);
    throw err;
  }
}
