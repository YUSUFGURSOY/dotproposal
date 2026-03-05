// server/src/controllers/proposalController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as proposalService from '../Service/proposalService';

// 1. TEKLİF OLUŞTURMA FONKSİYONU
export const createProposal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    // Bütün işi Service katmanına devrediyoruz
    const proposal = await proposalService.generateProposalService(userId, req.body);
    
    res.status(201).json(proposal);
  } catch (error: any) {
    console.error("❌ HATA DETAYI:", error);
    // Service katmanından fırlatılan özel mesajları frontend'e iletiyoruz
    const statusCode = error.message.includes('bulunamadı') || error.message.includes('Lütfen önce') ? 400 : 500;
    res.status(statusCode).json({ 
      message: error.message || 'Teklif oluşturulurken bir hata oluştu.' 
    });
  }
};

// 2. TÜM TEKLİFLERİ LİSTELEME
export const getMyProposals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const proposals = await proposalService.getAllUserProposalsService(req.user._id);
    res.json(proposals);
  } catch (error: any) {
    res.status(500).json({ message: 'Teklifler alınamadı.' });
  }
};

// 3. TEK BİR TEKLİFİ DETAYLI GETİRME
export const getProposalById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const proposal = await proposalService.getProposalByIdService(req.params.id, req.user._id);
      res.json(proposal);
    } catch (error: any) {
      console.error("Teklif detayı hatası:", error);
      res.status(404).json({ message: error.message || 'Sunucu hatası.' });
    }
};