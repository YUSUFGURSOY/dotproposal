import nodemailer from 'nodemailer';
import dotenv from 'dotenv'; 

dotenv.config();

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const userEmail = process.env.EMAIL_USER?.trim();
  const userPass = process.env.EMAIL_PASS?.trim();

  console.log(`📧 Mail gönderimi başlatılıyor... Alıcı: ${options.email}`);

  // 👇 Değişiklik Burada: createTransport parantezi içine ( { ... } as any ) ekledik
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    family: 4, // IPv6 hatasını (ENETUNREACH) çözmek için kritik
    auth: {
      user: userEmail,
      pass: userPass,
    },
    tls: {
      rejectUnauthorized: false 
    }
  } as any); // 👈 TypeScript hatasını bu "as any" çözecek

  const mailOptions = {
    from: `"DotProposal" <${userEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Mail başarıyla gönderildi!");
    console.log("📬 SMTP Yanıtı:", info.response);
  } catch (error: any) {
    console.error("❌ Nodemailer Gönderim Hatası:", error.message);
    if (error.code) {
      console.error("🛠️ Hata Kodu:", error.code);
    }
  }
};