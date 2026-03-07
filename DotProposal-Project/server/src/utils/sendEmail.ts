// server/src/utils/sendEmail.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'; 

dotenv.config();

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  
 // server/src/utils/sendEmail.ts
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // Render için en güvenli port budur
  secure: false, // TLS kullanımı
  auth: {
    user: process.env.EMAIL_USER, // dotpropoasal@gmail.com
    pass: process.env.EMAIL_PASS, // Yeni aldığın 16 haneli kod
  },
  tls: {
    rejectUnauthorized: false // Sertifika takılmalarını önler
  }
});

  const mailOptions = {
    from: `"DotProposal" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};