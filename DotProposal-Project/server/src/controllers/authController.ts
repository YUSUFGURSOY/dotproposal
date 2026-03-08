// server/src/controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/sendEmail';
import crypto from 'crypto'; // 👇 YENİ: Rastgele güvenli token üretmek için

// Token oluşturucu
const generateToken = (id: string | any) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'gizli_anahtar', {
    expiresIn: '30d',
  });
};

// --- REGISTER (KAYIT OL) ---
// --- REGISTER (KAYIT OL) ---
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
      return;
    }

    // 👇 YENİ: E-POSTA FORMAT KONTROLÜ (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Lütfen geçerli bir e-posta adresi girin. (Örn: isim@sirket.com)' });
      return;
    }

    // 👇 YENİ: ŞİFRE KARMAŞIKLIK KONTROLÜ (Regex)
    // Kural: En az 8 karakter, en az 1 büyük harf, en az 1 rakam
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({ 
        message: 'Şifreniz en az 8 karakter olmalı, en az 1 büyük harf ve 1 rakam içermelidir.' 
      });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
      return;
    }

    // Güvenli Doğrulama Token'ı Üret
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationCooldown = new Date(Date.now() + 60 * 1000); // 60 saniye bekleme süresi

    const user = await User.create({ 
      name, 
      email, 
      password,
      verificationToken, 
      verificationCooldown
    });

    if (user) {
      // Arka planda doğrulama mailini fırlat
      const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
      const message = `Merhaba ${user.name},\n\nDotProposal'a hoş geldin! Tüm özelliklere erişebilmek için lütfen aşağıdaki linke tıklayarak e-posta adresini doğrula:\n\n${verifyUrl}\n\nİyi çalışmalar!`;
      
      sendEmail({
        email: user.email,
        subject: '🚀 DotProposal - E-posta Adresini Doğrula',
        message: message,
      }).catch(err => console.error("Kayıt sonrası mail gönderilemedi:", err));

      res.status(201).json({
        _id: user._id, 
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        token: generateToken(user._id.toString()), 
      });
    } else {
      res.status(400).json({ message: 'Geçersiz kullanıcı verisi.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// --- LOGIN (GİRİŞ YAP) ---
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id, 
        name: user.name,
        email: user.email,
        cvFileName: user.cvFileName, 
        isVerified: user.isVerified, // 👇 YENİ: Frontend'in bilmesi için
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// --- GET ME (PROFİL) ---
export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Kullanıcı bilgisi alınamadı.' });
  }
};

// ... FORGOT PASSWORD VE RESET PASSWORD KODLARI BURADA AYNI KALACAK ...
// 1. ŞİFRE SIFIRLAMA KODU GÖNDERME
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'Bu e-posta adresine ait bir hesap bulunamadı.' });
      return;
    }

    if (user.resetPasswordCooldown && user.resetPasswordCooldown > new Date()) {
      const remainingSeconds = Math.ceil((user.resetPasswordCooldown.getTime() - Date.now()) / 1000);
      res.status(429).json({ message: `Lütfen yeni bir kod istemeden önce ${remainingSeconds} saniye bekleyin.` });
      return;
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); 
    user.resetPasswordCooldown = new Date(Date.now() + 2 * 60 * 1000);
    await user.save();

    const message = `Merhaba ${user.name},\n\nŞifrenizi sıfırlamak için onay kodunuz: ${resetCode}\n\nBu kod 10 dakika boyunca geçerlidir. Şifre sıfırlama talebinde bulunmadıysanız bu e-postayı görmezden gelebilirsiniz.`;
    
    await sendEmail({
      email: user.email,
      subject: '🔑 Şifre Sıfırlama Kodunuz - DotProposal',
      message: message,
    });

    res.status(200).json({ message: 'Sıfırlama kodu e-posta adresinize gönderildi.' });
  } catch (error) {
    console.error('Şifre sıfırlama mail hatası:', error);
    res.status(500).json({ message: 'İşlem sırasında bir hata oluştu.' });
  }
};

// 2. KODU DOĞRULAYIP YENİ ŞİFREYİ KAYDETME
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpire: { $gt: Date.now() } 
    });

    if (!user) {
      res.status(400).json({ message: 'Geçersiz veya süresi dolmuş kod girdiniz.' });
      return;
    }

    user.password = newPassword;
    
    user.resetPasswordCode = undefined;
    user.resetPasswordExpire = undefined;
    user.resetPasswordCooldown = undefined;
    await user.save();

    res.status(200).json({ message: 'Şifreniz başarıyla güncellendi! Artık giriş yapabilirsiniz.' });
  } catch (error) {
    console.error('Şifre güncelleme hatası:', error);
    res.status(500).json({ message: 'Şifre güncellenirken bir hata oluştu.' });
  }
};

// 👇 YENİ: E-POSTA DOĞRULAMA KONTROLÜ (Kullanıcı linke tıkladığında çalışır)
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      res.status(400).json({ message: 'Geçersiz veya süresi dolmuş doğrulama bağlantısı.' });
      return;
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Token'ı temizle (bir daha kullanılmasın)
    await user.save();

    res.status(200).json({ 
      message: 'E-posta adresiniz başarıyla doğrulandı!',
      isVerified: true 
    });
  } catch (error) {
    res.status(500).json({ message: 'Doğrulama işlemi sırasında sunucu hatası.' });
  }
};

// 👇 YENİ: DOĞRULAMA MAİLİNİ TEKRAR GÖNDERME (60 saniye korumalı)
export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ message: 'Bu hesap zaten doğrulanmış.' });
      return;
    }

    // Cooldown (Spam) Kontrolü
    if (user.verificationCooldown && user.verificationCooldown > new Date()) {
      const remainingSeconds = Math.ceil((user.verificationCooldown.getTime() - Date.now()) / 1000);
      res.status(429).json({ message: `Lütfen yeni bir mail istemeden önce ${remainingSeconds} saniye bekleyin.` });
      return;
    }

    // Yeni Token Üret ve Kaydet
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationCooldown = new Date(Date.now() + 60 * 1000); // 60 saniye ceza
    await user.save();

    // Mail Gönder
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
    const message = `Merhaba ${user.name},\n\nYeni doğrulama bağlantınız hazır. Lütfen aşağıdaki linke tıklayarak hesabınızı onaylayın:\n\n${verifyUrl}`;
    
    await sendEmail({
      email: user.email,
      subject: '🔄 DotProposal - Yeni Doğrulama Bağlantısı',
      message: message,
    });

    res.status(200).json({ message: 'Doğrulama e-postası tekrar gönderildi.' });
  } catch (error) {
    console.error('Doğrulama maili tekrar gönderme hatası:', error);
    res.status(500).json({ message: 'Mail gönderilirken bir hata oluştu.' });
  }
};
// 👇 GÜNCELLENDİ: KURŞUN GEÇİRMEZ MAGIC POLLING
export const checkVerificationStatus = async (req: any, res: Response): Promise<void> => {
  try {
    let userId = req.user?.id; // Eğer middleware ile gelirse (Gelecekte eklersen diye)

    // Eğer middleware yoksa, gelen header'dan token'ı kendimiz alıp çözüyoruz!
    if (!userId && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtar') as any;
      userId = decoded.id;
    }

    if (!userId) {
      res.status(401).json({ message: 'Yetkisiz erişim. Token bulunamadı.' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      return;
    }

    // Mutlu son: Sadece onay durumunu gönderiyoruz
    res.status(200).json({ isVerified: user.isVerified });
  } catch (error) {
    console.error("Radar Hatası:", error); // Terminalde daha detaylı log görebilmek için
    res.status(500).json({ message: 'Durum kontrolü sırasında sunucu hatası.' });
  }
};

// 👇 GÜNCELLENDİ: HESAP SİLME (DANGER ZONE - TOKEN KONTROLLÜ)
export const deleteAccount = async (req: any, res: Response): Promise<void> => {
  try {
    let userId = req.user?.id;

    // 👇 EKSİK OLAN SİHİRLİ KISIM: Frontend'den gelen token'ı kendimiz çözüyoruz!
    if (!userId && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtar') as any;
      userId = decoded.id;
    }

    if (!userId) {
      res.status(401).json({ message: 'Yetkisiz erişim. Token bulunamadı.' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      return;
    }

    // Kullanıcıyı veritabanından kalıcı olarak sil
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Hesabınız ve tüm verileriniz başarıyla silindi.' });
  } catch (error) {
    console.error('Hesap silme hatası:', error);
    res.status(500).json({ message: 'Hesap silinirken bir hata oluştu.' });
  }
};