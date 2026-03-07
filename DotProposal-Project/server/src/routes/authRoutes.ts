// server/src/routes/authRoutes.ts
import express from 'express';
import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  // 👇 1. ADIM: Yeni fonksiyonumuzu içeri aktarıyoruz
  checkVerificationStatus
} from '../controllers/authController';

// Not: Projende kullanıcı giriş yapmış mı diye kontrol eden middleware'in 
// (örneğin protect veya verifyToken) adını buraya import ettiğini varsayıyorum.
// import { protect } from '../middlewares/authMiddleware'; 

const router = express.Router();

console.log("🛠️ Auth Rotaları Yüklendi! (Dosya Okundu)");

router.post('/register', register);
router.post('/login', login); 
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// 👇 2. ADIM: Yeni radar rotamızı ekliyoruz 
// (Buraya mutlaka kullanıcının giriş yaptığını doğrulayan middleware'ini eklemelisin)
// Örnek: router.get('/check-status', protect, checkVerificationStatus);
router.get('/check-status', checkVerificationStatus); 

export default router;