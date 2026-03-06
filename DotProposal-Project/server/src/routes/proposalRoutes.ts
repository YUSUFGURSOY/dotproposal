// server/src/routes/proposalRoutes.ts
import express from 'express';
// 👇 updateProposal buraya eklendi
import { createProposal, getMyProposals, getProposalById, getPublicProposalById,updateDealStatus,addClientFeedback,markFeedbackAsRead, updateProposal  } from '../controllers/proposalController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// --- MÜŞTERİYE AÇIK ROTALAR (Giriş Şartı Yok) ---
router.get('/public/:id', getPublicProposalById);
router.post('/public/:id/feedback', addClientFeedback);

// --- YAZILIMCIYA ÖZEL KORUMALI ROTALAR (Giriş Şart) ---
router.post('/', protect, createProposal); // Teklif oluştur
router.get('/', protect, getMyProposals);  // Geçmiş teklifleri gör
router.get('/:id', protect, getProposalById); // Tek bir teklifin detayını ID ile getir
router.patch('/:id/status', protect, updateDealStatus);
router.patch('/:id/read-feedback', protect, markFeedbackAsRead);
router.put('/:id', protect, updateProposal); // 👇 YENİ: Teklifi manuel düzenleyip güncelleme rotası

export default router;