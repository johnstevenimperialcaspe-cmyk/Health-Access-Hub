import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

console.log("=== EMAIL CONFIGURATION TEST ===\n");

// Check environment variables
console.log("EMAIL_HOST:", process.env.EMAIL_HOST || "NOT SET");
console.log("EMAIL_PORT:", process.env.EMAIL_PORT || "NOT SET");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✓ SET" : "❌ NOT SET");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✓ SET" : "❌ NOT SET");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log("\n❌ ERROR: Email credentials not configured!");
  console.log("Please add EMAIL_USER and EMAIL_PASS to your .env file\n");
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test connection
console.log("\nTesting SMTP connection...\n");

transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ SMTP Connection Failed:");
    console.log("Error:", error.message);
    console.log("\nPossible issues:");
    console.log("1. Wrong email or app password");
    console.log("2. 2-Factor Authentication not enabled on Gmail");
    console.log("3. App password not generated correctly");
    console.log("4. Gmail account restrictions");
    process.exit(1);
  } else {
    console.log("✓ SMTP Connection Successful!\n");

    // Send test email
    console.log("Sending test email...\n");

    const mailOptions = {
      from: `EARIST Health Hub <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Test Email - EARIST Health Hub",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333;">Test Email Successful!</h2>
            <p>If you received this email, your Gmail configuration is working correctly.</p>
            <p>Time: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
      text: "Test email - if you received this, Gmail is configured correctly!",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("❌ Email Send Failed:");
        console.log("Error:", error.message);
        process.exit(1);
      } else {
        console.log("✓ Email Sent Successfully!");
        console.log("Message ID:", info.messageId);
        console.log("\nCheck your Gmail inbox for the test email.");
        process.exit(0);
      }
    });
  }
});
