// server/src/controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/sendEmail';

// Token oluşturucu
// id parametresini 'any' veya 'string' olarak alabiliriz
const generateToken = (id: string | any) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'gizli_anahtar', {
    expiresIn: '30d',
  });
};

// --- REGISTER (KAYIT OL) ---
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
      return;
    }

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id, // DÜZELTME: user.id -> user._id
        name: user.name,
        email: user.email,
        // DÜZELTME: ObjectId'yi string'e çeviriyoruz
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
        _id: user._id, // DÜZELTME: user.id -> user._id
        name: user.name,
        email: user.email,
        cvFileName: user.cvFileName, 
        // DÜZELTME: ObjectId'yi string'e çeviriyoruz
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
    // req.user.id middleware'den geliyor, orada sorun yoksa burası çalışır.
    // Ancak User modelinden gelen veride _id kullanılır.
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Kullanıcı bilgisi alınamadı.' });
  }
};

// 1. ŞİFRE SIFIRLAMA KODU GÖNDERME
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'Bu e-posta adresine ait bir hesap bulunamadı.' });
      return;
    }

    // Cooldown (Spam) Kontrolü
    if (user.resetPasswordCooldown && user.resetPasswordCooldown > new Date()) {
      const remainingSeconds = Math.ceil((user.resetPasswordCooldown.getTime() - Date.now()) / 1000);
      res.status(429).json({ message: `Lütfen yeni bir kod istemeden önce ${remainingSeconds} saniye bekleyin.` });
      return;
    }

    // 6 Haneli Rastgele Kod Üret
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Veritabanına Kaydet (10 Dk Geçerlilik, 2 Dk Bekleme Süresi)
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); 
    user.resetPasswordCooldown = new Date(Date.now() + 2 * 60 * 1000);
    await user.save();

    // Mail Gönder
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

    // Kullanıcıyı bul ve kodun süresinin geçmediğinden emin ol
    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpire: { $gt: Date.now() } // Şu anki zamandan büyük mü?
    });

    if (!user) {
      res.status(400).json({ message: 'Geçersiz veya süresi dolmuş kod girdiniz.' });
      return;
    }

    // Yeni şifreyi şifrele (Hash) ve kaydet
    user.password = newPassword;
    
    // Güvenlik: Kullanılmış kodu ve süreleri temizle
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