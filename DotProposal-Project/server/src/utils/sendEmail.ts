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
  port: 587, // 👇 Değiştirildi: 465 yerine 587 kullanıyoruz
  secure: false, // 👇 Değiştirildi: 587 portu için false olmalı
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // 👇 EKLENDİ: Bazı sunucularda sertifika hatalarını önlemek için
    rejectUnauthorized: false 
  }
});

  const mailOptions = {
    from: `DotProposal <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Not: Controller tarafında await'i kaldırdığımız için bu işlem arka planda çalışacak
  await transporter.sendMail(mailOptions);
};