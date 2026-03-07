import express from 'express';
// login fonksiyonunu da import etmeyi unutma!
import { register, login,forgotPassword, resetPassword } from '../controllers/authController';

const router = express.Router();

console.log("🛠️ Auth Rotaları Yüklendi! (Dosya Okundu)");

router.post('/register', register);
router.post('/login', login); // <--- YENİ EKLENDİ
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;