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
  
  // Taşıyıcıyı (transporter) daha spesifik SMTP ayarlarıyla oluşturuyoruz
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // SSL için 465 portu en güvenlisidir
    secure: true, // Port 465 olduğu için true yapıyoruz
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Buraya Gmail "Uygulama Şifresi" gelecek
    },
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