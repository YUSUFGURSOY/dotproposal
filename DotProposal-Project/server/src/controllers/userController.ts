// server/src/controllers/userController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';

// --- PROFİL GÜNCELLEME ---
// Hem yazıları (Title) hem de dosyayı (CV) güncelleyecek
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Gelen verileri al (Eğer boşsa eskisini koru)
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.title = req.body.title || user.title; // Örn: Frontend Developer

      // Eğer dosya yüklendiyse adını kaydet
      if (req.file) {
        user.cvFileName = req.file.filename;
      }

      // Şifre değişikliği varsa (Opsiyonel, şimdilik basit tutalım)
      if (req.body.password) {
        user.password = req.body.password; 
        // Not: User modelindeki 'pre save' hook sayesinde otomatik hash'lenmeli.
        // Eğer modelde hook yoksa burada hashlemek gerekir.
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        title: updatedUser.title,
        cvFileName: updatedUser.cvFileName,
        token: req.headers.authorization?.split(' ')[1] // Mevcut token'ı geri dön
      });
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Profil güncellenirken hata oluştu' });
  }
};

// --- PROFİL BİLGİSİNİ GETİR ---
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        title: user.title,
        cvFileName: user.cvFileName
      });
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};