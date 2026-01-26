import nodemailer from "nodemailer";

// For Gmail, you need to:
// 1. Enable 2-Factor Authentication
// 2. Generate an App Password at https://myaccount.google.com/apppasswords
// 3. Use that password here (not your actual Gmail password)

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password",
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`✅ Email sent: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Failed to send email");
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function sendPasswordResetEmail(
  email: string,
  otp: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p style="color: #666; font-size: 16px;">
        We received a request to reset your password. Use the OTP below to proceed:
      </p>
      <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <h1 style="color: #0066cc; margin: 0; letter-spacing: 5px; font-family: monospace;">
          ${otp}
        </h1>
      </div>
      <p style="color: #666; font-size: 14px;">
        This OTP will expire in 10 minutes. If you didn't request a password reset, please ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        TaskFlow Security Team
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Password Reset OTP - TaskFlow",
    html,
  });
}
