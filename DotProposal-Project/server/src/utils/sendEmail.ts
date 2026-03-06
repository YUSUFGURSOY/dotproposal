// server/src/utils/sendEmail.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'; 

// 👇 YENİ: Node.js'e "Önce .env dosyasını oku, sonra işine bak" emrini veriyoruz
dotenv.config();

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  
  // Artık şifreyi görebildiğinden emin olmak için ufak bir kontrol (Çalışınca bu logları silebilirsin)
  console.log("🎯 Node.js Uyandı! Gönderen Mail:", process.env.EMAIL_USER);

  // E-postayı gönderecek olan taşıyıcıyı (transporter) oluşturuyoruz
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `DotProposal Bildirim <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};