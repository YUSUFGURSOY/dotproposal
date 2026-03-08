// server/src/controllers/userController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';

// --- PROFİL GÜNCELLEME ---
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Gelen verileri al (Eğer boşsa eskisini koru)
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.title = req.body.title || user.title; 
      user.githubLink = req.body.githubLink || user.githubLink; 

      // ONBOARDING DURUMUNU KAYDET 
      if (req.body.hasCompletedOnboarding !== undefined) {
        user.hasCompletedOnboarding = req.body.hasCompletedOnboarding === 'true' || req.body.hasCompletedOnboarding === true;
      }

      if (req.file) {
        user.cvFileName = req.file.path;
      }

      if (req.body.password) {
        user.password = req.body.password; 
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        title: updatedUser.title,
        cvFileName: updatedUser.cvFileName,
        githubLink: updatedUser.githubLink, 
        hasCompletedOnboarding: updatedUser.hasCompletedOnboarding,
        isVerified: updatedUser.isVerified, // 👇 İŞTE SİHİRLİ DOKUNUŞ: Frontend artık bunu unutmayacak!
        token: req.headers.authorization?.split(' ')[1] 
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
        cvFileName: user.cvFileName,
        githubLink: user.githubLink,
        hasCompletedOnboarding: user.hasCompletedOnboarding, // Buralara da sağlama amaçlı ekledik
        isVerified: user.isVerified 
      });
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};