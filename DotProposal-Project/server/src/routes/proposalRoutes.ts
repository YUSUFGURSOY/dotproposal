import express from 'express';
// 1. 'getPublicProposalById' buraya eklendi
import { createProposal, getMyProposals, getProposalById, getPublicProposalById,updateDealStatus,addClientFeedback,markFeedbackAsRead  } from '../controllers/proposalController';
import { protect } from '../middleware/authMiddleware';


const router = express.Router();

// --- MÜŞTERİYE AÇIK ROTALAR (Giriş Şartı Yok) ---
// Dikkat: Bu rotanın diğerleriyle karışmaması için '/public/:id' diyoruz
router.get('/public/:id', getPublicProposalById);

// --- YAZILIMCIYA ÖZEL KORUMALI ROTALAR (Giriş Şart) ---
router.post('/', protect, createProposal); // Teklif oluştur
router.get('/', protect, getMyProposals);  // Geçmiş teklifleri gör
router.get('/:id', protect, getProposalById); // Tek bir teklifin detayını ID ile getir
router.patch('/:id/status', protect, updateDealStatus);
router.post('/public/:id/feedback', addClientFeedback);
router.patch('/:id/read-feedback', protect, markFeedbackAsRead);
export default router;
