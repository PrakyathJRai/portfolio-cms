
import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

if (!EMAIL_USER || !EMAIL_APP_PASSWORD || !ADMIN_EMAIL) {
  throw new Error("Email environment variables are missing");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_APP_PASSWORD,
  },
});

interface ContactEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendContactNotification = async (
  contact: ContactEmailData
): Promise<void> => {
  await transporter.sendMail({
    from: `"Portfolio Contact Form" <${EMAIL_USER}>`,
    to: ADMIN_EMAIL,
    replyTo: contact.email,
    subject: `New Portfolio Message: ${contact.subject}`,
    text: `
You received a new message through your portfolio website.

Name: ${contact.name}
Email: ${contact.email}
Subject: ${contact.subject}

Message:
${contact.message}
    `,
  });
};
