import nodemailer from 'nodemailer';

export async function sendMail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER_EMAIL,     // your Gmail
      pass: process.env.GMAIL_APP_PASSWORD    // your App Password
    }
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER_EMAIL,
    to,
    subject,
    html
  });
}
