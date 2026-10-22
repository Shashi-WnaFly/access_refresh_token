if (!process.env.MONGO_URI) throw new Error("Database envs are not available.");
if (!process.env.JWT_SECRET) throw new Error("JWT envs are not available.");
if (
  !process.env.BREVO_SMTP_USER ||
  !process.env.BREVO_SMTP_PASS ||
  !process.env.SENDER_EMAIL
)
  throw new Error("Email envs are not available.");

const config = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  BREVO_SMTP_USER: process.env.BREVO_SMTP_USER,
  BREVO_SMTP_PASS: process.env.BREVO_SMTP_PASS,
  SENDER_EMAIL: process.env.SENDER_EMAIL,
};

export default config;
