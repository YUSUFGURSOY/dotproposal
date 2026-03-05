// server/src/controllers/proposalController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as proposalService from '../Service/proposalService';
import { getChannel } from '../config/rabbitmq'; // 👈 YENİ EKLENDİ: RabbitMQ kanalı
import Proposal from '../models/Proposal';       // 👈 YENİ EKLENDİ: Veritabanı modeli

// 1. TEKLİF OLUŞTURMA FONKSİYONU (GÜNCELLENDİ: RabbitMQ Asenkron Yapı)
export const createProposal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    
    // Frontend'den gelen verileri alıyoruz
    const { jobTitle, jobDescription } = req.body; 

    // 1. Veritabanında "pending" (bekliyor) durumunda bir taslak kayıt oluştur
    const newProposal = new Proposal({
      user: userId,
      status: 'pending', // İşçi bitirene kadar beklemede kalacak
      
      // Mongoose kızmasın diye gerekli alanları dolduruyoruz:
      jobTitle: jobTitle || 'Taslak İş Başlığı', 
      jobDescription: jobDescription || 'Taslak İş Açıklaması',
      generatedCoverLetter: 'Yapay zeka teklifinizi hazırlıyor, lütfen bekleyin...', 
      
      createdAt: new Date()
    });
    
    await newProposal.save();

    // 2. RabbitMQ kanalını al
    const channel = getChannel();
    if (!channel) {
       res.status(500).json({ message: "Mesaj kuyruğu bağlantısı bulunamadı." });
       return;
    }

    // 3. İşçiye (Worker) gönderilecek paket veriyi hazırla
    const queueData = {
      proposalId: newProposal._id,
      userId: userId,
      requestBody: req.body // Frontend'den gelen ilan bilgileri vb.
    };

    // 4. Mesajı kuyruğa fırlat
    channel.sendToQueue(
      'proposal_queue',
      Buffer.from(JSON.stringify(queueData)),
      { persistent: true } // Mesajın kaybolmamasını garanti altına al
    );

    // 5. Kullanıcıya ANINDA cevap dön (Gemini'yi beklemiyoruz!)
    res.status(202).json({
      message: 'Teklifiniz sıraya alındı ve arka planda hazırlanıyor.',
      proposalId: newProposal._id
    });

  } catch (error: any) {
    console.error("❌ HATA DETAYI:", error);
    res.status(500).json({ 
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