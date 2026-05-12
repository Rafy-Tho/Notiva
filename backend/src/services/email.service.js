import { send } from "../config/mailer.js";

export async function sendResetEmail(toEmail, link) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f7; line-height: 1.6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Reset Your Password</h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px;">Hello,</p>
                    <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px;">We received a request to reset the password for your account. Click the button below to create a new password:</p>
                    
                    <!-- Button -->
                    <div style="text-align: center; margin: 35px 0;">
                      <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.3s ease;">Reset Password</a>
                    </div>
                    
                    <p style="margin: 0 0 20px 0; color: #555555; font-size: 14px;">Or copy and paste this link into your browser:</p>
                    <div style="background-color: #f7f7f9; border-left: 4px solid #667eea; padding: 12px 15px; margin: 0 0 25px 0; word-break: break-all;">
                      <code style="color: #555555; font-size: 14px; font-family: monospace;">${link}</code>
                    </div>
                    
                    <p style="margin: 0 0 10px 0; color: #555555; font-size: 14px;">This link will expire in 1 hour.</p>
                    <p style="margin: 0 0 10px 0; color: #555555; font-size: 14px;">If you didn't request this, please ignore this email or contact support if you have concerns.</p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #eaeaea;">
                    <p style="margin: 0 0 10px 0; color: #888888; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
                    <p style="margin: 0; color: #888888; font-size: 12px;">&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await send({
      to: toEmail,
      subject: "Password Reset Request",
      text: `Reset your password by visiting this link: ${link}`,
      html: html,
    });
  } catch (err) {
    console.error("❌ Email error:", err.message);
    throw err; // Re-throw to handle it at a higher level if needed
  }
}
