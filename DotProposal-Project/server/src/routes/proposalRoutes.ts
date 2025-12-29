import express from 'express';
// 1. 'getProposalById' buraya eklendi
import { createProposal, getMyProposals, getProposalById } from '../controllers/proposalController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Tüm teklif rotaları korumalıdır (Giriş şart)
router.post('/', protect, createProposal); // Teklif oluştur
router.get('/', protect, getMyProposals);  // Geçmiş teklifleri gör

// 2. YENİ ROTA: Tek bir teklifin detayını ID ile getir
router.get('/:id', protect, getProposalById);

export default router;