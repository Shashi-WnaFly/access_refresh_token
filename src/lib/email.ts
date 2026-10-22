import nodemailer from "nodemailer";
import config from "../config/config.js";

export async function SendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: config.BREVO_SMTP_USER,
      pass: config.BREVO_SMTP_PASS,
    },
  });

  await transporter.sendMail({
    to,
    from: config.SENDER_EMAIL,
    subject,
    html,
  });
}
