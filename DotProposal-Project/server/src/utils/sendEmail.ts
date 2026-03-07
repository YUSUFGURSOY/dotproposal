// server/src/utils/sendEmail.ts
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string; // Daha şık mailler için HTML desteği
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  console.log(`🚀 Kurumsal Mail Fırlatılıyor... Alıcı: ${options.email}`);

  // 👇 İÇERİK HAZIRLIĞI: Gelen mesajı veya HTML'i şık bir formata sokuyoruz
  const innerContent = options.html || `<p style="font-size: 16px; line-height: 1.6; color: #e2e8f0; margin: 0;">${options.message}</p>`;

  // 👇 ŞIK TASARIM: Koyu Lacivert & Beyaz Kurumsal Şablon
  const stylishHtmlTemplate = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0f1c; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0f1c; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #111827; border-radius: 12px; overflow: hidden; border: 1px solid #1f2937; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
              
              <tr>
                <td style="padding: 30px 40px; text-align: center; border-bottom: 1px solid #1f2937; background-color: #111827;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">DotProposal</h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px; background-color: #111827;">
                  ${innerContent}
                </td>
              </tr>
              
              <tr>
                <td style="padding: 20px 40px; text-align: center; background-color: #0a0f1c; border-top: 1px solid #1f2937;">
                  <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                    © ${new Date().getFullYear()} DotProposal. Tüm hakları saklıdır.<br>
                    <a href="mailto:destek@dotproposal.com" style="color: #9ca3af; text-decoration: none;">destek@dotproposal.com</a>
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'DotProposal <destek@dotproposal.com>',
      to: [options.email],
      subject: options.subject,
      text: options.message,
      html: stylishHtmlTemplate, // 👈 Harika tasarımımızı buraya bağladık!
      replyTo: 'dotpropoasal@gmail.com',
    });

    if (error) {
      console.error("❌ Resend API Hatası:", error.message);
      
      if (error.name === 'validation_error') {
        console.warn("⚠️ Not: Alan adı doğrulaması (DKIM) henüz tamamlanmamış olabilir. Lütfen Resend panelini kontrol et.");
      }
      return;
    }

    console.log("✅ Mail Gönderimi Başarılı! Takip ID:", data?.id);
    
  } catch (catchError: any) {
    console.error("❌ Beklenmeyen Sistem Hatası:", catchError.message);
  }
};