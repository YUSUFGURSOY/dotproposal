// server/src/routes/authRoutes.ts
import express from 'express';
import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword,
  // 👇 YENİ EKLENENLER
  verifyEmail,
  resendVerificationEmail
} from '../controllers/authController';

const router = express.Router();

console.log("🛠️ Auth Rotaları Yüklendi! (Dosya Okundu)");

router.post('/register', register);
router.post('/login', login); 
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// 👇 YENİ EKLENEN ROTALAR
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

export default router;