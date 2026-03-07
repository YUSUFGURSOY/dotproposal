// server/src/utils/sendEmail.ts
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  console.log(`🚀 Resend ile mail fırlatılıyor... Alıcı: ${options.email}`);

  try {
    // 👇 GÜNCELLEME: Resend artık sonucu { data, error } olarak döndürüyor
    const { data, error } = await resend.emails.send({
      from: 'DotProposal Bildirim <onboarding@resend.dev>',
      to: [options.email], // Kendi kayıtlı mail adresin olmalı
      subject: options.subject,
      text: options.message,
    });

    // Eğer Resend tarafından bir hata döndüyse
    if (error) {
      console.error("❌ Resend API Hatası:", error);
      return;
    }

    // Başarılıysa ID'yi yazdır (data?.id kullanarak TypeScript'i güvenceye alıyoruz)
    console.log("✅ Resend Gönderimi Başarılı! ID:", data?.id);
    
  } catch (catchError: any) {
    // Kodsal veya bağlantısal bir çökme olursa
    console.error("❌ Beklenmeyen Sistem Hatası:", catchError.message);
  }
};