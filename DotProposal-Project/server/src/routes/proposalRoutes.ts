// server/src/routes/proposalRoutes.ts
import express from 'express';
import { 
  createProposal, getMyProposals, getProposalById, getPublicProposalById,
  updateDealStatus, addClientFeedback, markFeedbackAsRead, updateProposal, 
  enhanceProposalText, deleteProposal, togglePinProposal // 👇 EKLENDİ
} from '../controllers/proposalController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// --- MÜŞTERİYE AÇIK ROTALAR (Giriş Şartı Yok) ---
router.get('/public/:id', getPublicProposalById);
router.post('/public/:id/feedback', addClientFeedback);

// --- YAZILIMCIYA ÖZEL KORUMALI ROTALAR (Giriş Şart) ---
router.post('/', protect, createProposal);
router.get('/', protect, getMyProposals);
router.get('/:id', protect, getProposalById);
router.patch('/:id/status', protect, updateDealStatus);
router.patch('/:id/read-feedback', protect, markFeedbackAsRead);
router.put('/:id', protect, updateProposal);
router.post('/enhance', protect, enhanceProposalText);
router.delete('/:id', protect, deleteProposal);
router.patch('/:id/pin', protect, togglePinProposal); // 👇 YENİ: Raptiye rotası

export default router;