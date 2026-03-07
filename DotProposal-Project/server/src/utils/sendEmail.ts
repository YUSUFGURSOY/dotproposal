import nodemailer from 'nodemailer';
import dotenv from 'dotenv'; 

dotenv.config();

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // 1. Email adresini temizle (Render panelindeki olası gizli boşlukları siler)
  const userEmail = process.env.EMAIL_USER?.trim();
  const userPass = process.env.EMAIL_PASS?.trim();

  console.log(`📧 Mail gönderimi başlatılıyor... Alıcı: ${options.email}`);

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS kullanımı için false olmalı
    auth: {
      user: userEmail,
      pass: userPass,
    },
    tls: {
      rejectUnauthorized: false // Sertifika hatalarını önler
    }
  });

  const mailOptions = {
    // Gmail "from" adresinin auth kullanıcı ile birebir aynı olmasını şart koşar
    from: `"DotProposal" <${userEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    // Bu logları Render panelinde gördüğünde mail kesinlikle gönderilmiştir
    console.log("✅ Mail başarıyla gönderildi!");
    console.log("📬 SMTP Yanıtı:", info.response);
    console.log("🆔 Mesaj ID:", info.messageId);
  } catch (error: any) {
    // Eğer hala bir sorun varsa, hata kodunu buradan net bir şekilde okuyacağız
    console.error("❌ Nodemailer Gönderim Hatası:", error.message);
    if (error.code === 'EAUTH') {
      console.error("🔑 HATA: Şifre veya Kullanıcı adı yanlış. Uygulama şifresini kontrol edin.");
    }
  }
};