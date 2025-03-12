import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `http://localhost:3000/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - Nexify',
    html: `Please click this link to verify your email: <a href="${url}">${url}</a>`,
  });
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const url = `http://localhost:3000/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Password - Nexify',
    html: `Please click this link to reset your password: <a href="${url}">${url}</a>`,
  });
};