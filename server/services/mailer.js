import nodemailer from "nodemailer";

function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user,
      pass
    }
  });
}

export async function sendOtpEmail(toEmail, otp) {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || `"FLEXYWORK Verification" <${process.env.SMTP_USER || "no-reply@flexywork.com"}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f8; margin: 0; padding: 40px 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #4f46e5; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .content { padding: 32px 28px; text-align: center; color: #1f2937; }
          .title { font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 8px; color: #111827; }
          .subtitle { font-size: 14px; color: #6b7280; margin-bottom: 24px; line-height: 1.5; }
          .otp-card { background: #f3f4f6; border-radius: 12px; padding: 18px 24px; display: inline-block; margin: 12px 0 24px 0; border: 1px dashed #cbd5e1; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4338ca; font-family: monospace; }
          .note { font-size: 12px; color: #9ca3af; line-height: 1.5; margin-top: 16px; }
          .footer { background: #f9fafb; padding: 16px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FLEXYWORK</h1>
          </div>
          <div class="content">
            <h2 class="title">Verify Your Email Address</h2>
            <p class="subtitle">Use the verification code below to complete your registration on FLEXYWORK. This code is valid for 10 minutes.</p>
            <div class="otp-card">
              <div class="otp-code">${otp}</div>
            </div>
            <p class="note">If you did not request this verification code, please ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} FLEXYWORK. Right person. Right place. Right time.
          </div>
        </div>
      </body>
    </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to: toEmail,
        subject: `${otp} is your FLEXYWORK Verification Code`,
        text: `Your FLEXYWORK email verification code is: ${otp}. It is valid for 10 minutes.`,
        html: htmlContent
      });
      console.log(`[EMAIL] OTP sent to ${toEmail} via SMTP`);
      return { sent: true };
    } catch (err) {
      console.error(`[EMAIL ERROR] Failed to send email via SMTP:`, err.message);
      // Fallback log for development
      console.log(`[DEV OTP FALLBACK] OTP for ${toEmail}: ${otp}`);
      return { sent: false, error: err.message, devOtp: otp };
    }
  } else {
    // When SMTP credentials are not yet configured in .env, log to console for development testing
    console.log(`\n======================================================`);
    console.log(`[FLEXYWORK OTP VERIFICATION]`);
    console.log(`Email: ${toEmail}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`(Configure SMTP_USER & SMTP_PASS in .env to deliver real emails)`);
    console.log(`======================================================\n`);
    return { sent: true, devMode: true };
  }
}
