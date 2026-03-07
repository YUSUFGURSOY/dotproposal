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
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // 465 yerine 587'ye geçiyoruz
    secure: false, // 587 portu STARTTLS kullandığı için burası false olmalı
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // Bazı sunucuların bağlantıyı reddetmemesi için bu ayar hayat kurtarır
      rejectUnauthorized: false 
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