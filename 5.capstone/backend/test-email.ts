import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function testEmail() {
  console.log("🔍 Testing Gmail SMTP Connection...\n");
  console.log("Configuration:");
  console.log(`  EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(
    `  EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? "***" : "NOT SET"}`
  );
  console.log(`  EMAIL_FROM: ${process.env.EMAIL_FROM}`);
  console.log("");

  try {
    // Verify connection
    console.log("Verifying transporter connection...");
    await transporter.verify();
    console.log("✅ Transporter verified successfully!\n");

    // Send test email
    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: "joeben2211@gmail.com",
      subject: "TaskFlow - OTP Test",
      html: `
        <h2>Test OTP</h2>
        <p>This is a test email to verify email sending works.</p>
        <p>Test Code: <strong>123456</strong></p>
      `,
    });
    console.log("✅ Email sent successfully!");
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
  } catch (error) {
    console.error("❌ Error occurred:");
    if (error instanceof Error) {
      console.error(`   Code: ${(error as any).code}`);
      console.error(`   Message: ${error.message}`);
      console.error(`   Details: ${JSON.stringify(error, null, 2)}`);
    } else {
      console.error(`   ${error}`);
    }
  }

  process.exit(0);
}

testEmail();
