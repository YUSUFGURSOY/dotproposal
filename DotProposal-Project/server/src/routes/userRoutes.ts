// server/src/routes/userRoutes.ts
import express from 'express';
import { updateProfile, getProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

// Bu rotalar KORUMALI (protect) olacak
// GET /api/users/profile -> Profil bilgilerini getir
router.get('/profile', protect, getProfile);

// PUT /api/users/profile -> Profili güncelle (Dosya yükleme dahil)
// 'cvFile' frontend'den gelecek dosya alanının adı olacak
router.put('/profile', protect, upload.single('cvFile'), updateProfile);

export default router;