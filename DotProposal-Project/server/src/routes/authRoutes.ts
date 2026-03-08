// server/src/routes/authRoutes.ts
import express from 'express';
import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  checkVerificationStatus,
  deleteAccount // 👇 1. YENİ: Hesap silme fonksiyonunu içeri aktardık
} from '../controllers/authController';

const router = express.Router();

console.log("🛠️ Auth Rotaları Yüklendi! (Dosya Okundu)");

// --- GENEL ROTALAR ---
router.post('/register', register);
router.post('/login', login); 
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// --- KULLANICI İŞLEMLERİ (Özel Rotalar) ---

// 👇 Radar Rotası (E-posta doğrulama kontrolü için)
router.get('/check-status', checkVerificationStatus); 

// 👇 2. YENİ: Hesap Silme Rotası (Danger Zone)
router.delete('/delete-account', deleteAccount); 

export default router;