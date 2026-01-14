import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendMail({ to, subject, html, text }) {
  if (!process.env.EMAIL_USER) {
    return { skipped: true };
  }

  const info = await transporter.sendMail({
    from: `EARIST Health Hub <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });

  return info;
}
