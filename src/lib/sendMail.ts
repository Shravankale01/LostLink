import nodemailer from 'nodemailer';

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailParams) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER_EMAIL,      // your Gmail
      pass: process.env.GMAIL_APP_PASSWORD,    // your App Password
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER_EMAIL,
    to,
    subject,
    html,
  });
}


