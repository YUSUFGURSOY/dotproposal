// server/src/controllers/proposalController.ts
// 👇 Request eklendi (Giriş yapmamış müşteri için)
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as proposalService from '../Service/proposalService';
import { getChannel } from '../config/rabbitmq'; 
import Proposal from '../models/Proposal';       

// 1. TEKLİF OLUŞTURMA FONKSİYONU 
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

// 3. TEK BİR TEKLİFİ DETAYLI GETİRME (Yazılımcı İçin - Gizli Veriler Dahil)
export const getProposalById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const proposal = await proposalService.getProposalByIdService(req.params.id, req.user._id);
      res.json(proposal);
    } catch (error: any) {
      console.error("Teklif detayı hatası:", error);
      res.status(404).json({ message: error.message || 'Sunucu hatası.' });
    }
};

// 4. YENİ: MÜŞTERİYE ÖZEL AÇIK LİNK (Giriş Şartı Yok, Gizli Veriler Yok)
export const getPublicProposalById = async (req: Request, res: Response): Promise<void> => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      res.status(404).json({ message: 'Teklif bulunamadı veya silinmiş.' });
      return;
    }

    // Müşteri linki ilk defa açıyorsa, "Okundu" olarak işaretle ve saati kaydet
    if (!proposal.isViewed) {
      proposal.isViewed = true;
      proposal.viewedAt = new Date();
      await proposal.save();
    }

    // DİKKAT: Veritabanından gelen veriyi süzüyoruz.
    // aiInsights (Tavsiyeler) KESİNLİKLE müşteriye gönderilmiyor!
    const publicData = {
      _id: proposal._id,
      jobTitle: proposal.jobTitle,
      companyName: proposal.companyName,
      jobDescription: proposal.jobDescription,
      generatedCoverLetter: proposal.generatedCoverLetter,
      createdAt: proposal.createdAt
    };

    res.json(publicData);
  } catch (error: any) {
    console.error("Açık teklif linki hatası:", error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};
// 5. YENİ: ANLAŞMA DURUMUNU (MİNİ-CRM) GÜNCELLEME
export const updateDealStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dealStatus } = req.body;
    
    // Güvenlik: Sadece geçerli statüleri kabul et
    const validStatuses = ['Taslak', 'İletildi', 'Kabul Edildi', 'Reddedildi'];
    if (!validStatuses.includes(dealStatus)) {
      res.status(400).json({ message: 'Geçersiz statü.' });
      return;
    }

    // Teklifi bul ve sadece dealStatus'u güncelle
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, // Başkasının teklifini değiştiremesin
      { dealStatus },
      { new: true }
    );

    if (!proposal) {
      res.status(404).json({ message: 'Teklif bulunamadı.' });
      return;
    }

    res.json(proposal);
  } catch (error: any) {
    console.error("Statü güncelleme hatası:", error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// 6. YENİ: MÜŞTERİDEN GELEN GERİ BİLDİRİMİ KAYDETME (AÇIK ROTA)
export const addClientFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { feedback } = req.body;
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      res.status(404).json({ message: 'Teklif bulunamadı.' });
      return;
    }

    // Müşteriden gelen mesajı veritabanına kaydet
    proposal.clientFeedback = feedback;
    proposal.clientFeedbackDate = new Date(); 
    proposal.isClientFeedbackRead = false;
    await proposal.save();

    res.status(200).json({ message: 'Geri bildirim başarıyla iletildi.' });
  } catch (error: any) {
    console.error("Geri bildirim kaydetme hatası:", error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};
// 7. YENİ: MÜŞTERİ MESAJINI OTOMATİK OKUNDU YAP
export const markFeedbackAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isClientFeedbackRead: true }, // 👈 Mesajı silmiyoruz, sadece okundu yapıyoruz
      { new: true }
    );
    res.json({ message: 'Mesaj okundu olarak işaretlendi.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};