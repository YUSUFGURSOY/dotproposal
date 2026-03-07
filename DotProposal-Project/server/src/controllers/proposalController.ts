// server/src/controllers/proposalController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as proposalService from '../Service/proposalService';
// [DEVRE DIŞI BIRAKILDI - MVP SÜRÜMÜ]
// import { getChannel } from '../config/rabbitmq'; 
import Proposal from '../models/Proposal';       
import User from '../models/User'; 
import { sendEmail } from '../utils/sendEmail'; // Mail aracımızı çağırdık
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv'; 
dotenv.config();

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

    /* --- [DEVRE DIŞI BIRAKILDI - MVP SÜRÜMÜ] RABBITMQ İLE ASENKRON İŞLEME ---
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
    ------------------------------------------------------------------------- */

    // 👇 YENİ: SENKRON İŞLEME (RABBITMQ OLMADAN DOĞRUDAN YAPAY ZEKA ÇAĞRISI)
    // Bekleme durumu (202) yerine doğrudan servise işi veriyoruz ve bitmesini bekliyoruz.
    try {
        // Yapay zeka servisini doğrudan çağır
        await proposalService.generateProposalService(userId, req.body, newProposal._id.toString());
        
        // İşlem bittikten sonra frontend'e başarı cevabı dön
        res.status(200).json({
          message: 'Teklifiniz başarıyla oluşturuldu!',
          proposalId: newProposal._id
        });
    } catch (aiError: any) {
        console.error("Yapay Zeka (Doğrudan) İşlem Hatası:", aiError);
        // Hata olursa veritabanındaki "pending" teklifi hata durumuna çek
        await Proposal.findByIdAndUpdate(newProposal._id, {
            status: 'failed',
            generatedCoverLetter: `Bir hata oluştu: ${aiError.message}`
        });
        
        res.status(500).json({ 
          message: 'Yapay zeka teklif oluştururken bir sorunla karşılaştı.',
          proposalId: newProposal._id
        });
    }

  } catch (error: any) {
    console.error("❌ HATA DETAYI:", error);
    res.status(500).json({ 
      message: error.message || 'Teklif oluşturulurken genel bir hata oluştu.' 
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

// 6. YENİ: MÜŞTERİDEN GELEN GERİ BİLDİRİMİ KAYDETME VE MAİL ATMA
export const addClientFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { feedback } = req.body;
    
    // YENİ: Teklifi çekerken, teklif sahibinin (user) isim ve mail bilgisini de getiriyoruz
    const proposal = await Proposal.findById(req.params.id).populate('user', 'name email');

    if (!proposal) {
      res.status(404).json({ message: 'Teklif bulunamadı.' });
      return;
    }

    // Mesajı veritabanına kaydet
    proposal.clientFeedback = feedback;
    proposal.clientFeedbackDate = new Date();
    proposal.isClientFeedbackRead = false;
    await proposal.save();

    // 👇 YENİ: SİSTEMİ BOZMADAN ARKA PLANDA E-POSTA GÖNDERME KISMI
    try {
      const user: any = proposal.user;
      if (user && user.email) {
        const message = `Merhaba ${user.name},\n\n"${proposal.jobTitle}" başlıklı projeniz için müşterinizden yeni bir mesaj geldi!\n\nMesaj Detayı:\n"${feedback}"\n\nLütfen DotProposal paneline girerek mesajı kontrol edin ve müşterinize dönüş yapın.\n\nİyi çalışmalar,\nDotProposal Bildirim Sistemi`;
        
        await sendEmail({
          email: user.email, // Teklif sahibinin kayıtlı e-posta adresi
          subject: '💬 Yeni Mesaj Var! - DotProposal',
          message: message,
        });
      }
    } catch (emailError) {
      console.error('E-posta gönderilemedi (Ancak mesaj veritabanına kaydedildi):', emailError);
    }

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

// 8. YENİ: TEKLİF METNİNİ MANUEL DÜZENLEME (YAZILIMCI İÇİN)
export const updateProposal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { generatedCoverLetter } = req.body;
    
    // Yalnızca teklif sahibi bu teklifi güncelleyebilir
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { generatedCoverLetter },
      { new: true } // Güncellenmiş dokümanı geri dön
    );

    if (!proposal) {
      res.status(404).json({ message: 'Teklif bulunamadı veya yetkiniz yok.' });
      return;
    }

    res.json({ message: 'Teklif başarıyla güncellendi!', proposal });
  } catch (error: any) {
    console.error("Teklif güncelleme hatası:", error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// 9. YENİ: YAPAY ZEKA İLE METİN İYİLEŞTİRME (SİHİRLİ DEĞNEK)
export const enhanceProposalText = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text, instruction } = req.body;
    
    if (!text) {
      res.status(400).json({ message: 'Lütfen düzenlenecek bir metin sağlayın.' });
      return;
    }

    // Gemini API'yi başlatıyoruz
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    
    // 👇 Kendi model ismini kullan (gemini-pro, gemini-1.5-flash vb.)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

    // 👇 YENİ: YAPAY ZEKAYI SUSTURAN KATI KURAL
    const strictRule = `
      ÇOK ÖNEMLİ KURAL: Bana SADECE VE SADECE güncellenmiş teklif metnini döndüreceksin. 
      - Başına "İşte yeni metin", "Harika bir teklif" gibi giriş cümleleri YAZMA. 
      - Sonuna "Şu değişiklikleri yaptım", "Nedenleri şunlar" gibi açıklamalar KESİNLİKLE EKLEME. 
      - Doğrudan Markdown formatındaki metinle başla ve metinle bitir.
    `;

    let prompt = "";
    if (instruction === 'professional') {
      prompt = "Aşağıdaki teklif metnini daha profesyonel, kurumsal ve ikna edici bir dille yeniden yaz.\n\n" + strictRule + "\n\nTeklif Metni:\n" + text;
    } else if (instruction === 'shorter') {
      prompt = "Aşağıdaki teklif metnini anlamını kaybetmeden, daha kısa, öz ve vurucu bir şekilde özetleyerek yeniden yaz.\n\n" + strictRule + "\n\nTeklif Metni:\n" + text;
    } else if (instruction === 'grammar') {
      prompt = "Aşağıdaki teklif metninin hiçbir anlamını veya cümlesini değiştirmeden, sadece yazım hatalarını ve dilbilgisi bozukluklarını düzelt.\n\n" + strictRule + "\n\nTeklif Metni:\n" + text;
    } else {
      // 4. SEÇENEK: KULLANICININ ÖZEL TALİMATI
      prompt = `Aşağıdaki teklif metnini sana verilen özel talimata göre yeniden yaz.\n\nÖzel Talimat: "${instruction}"\n\n` + strictRule + `\n\nTeklif Metni:\n${text}`;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({ enhancedText: responseText });
  } catch (error: any) {
    console.error("Yapay Zeka İyileştirme Hatası:", error);
    res.status(500).json({ message: 'Yapay zeka ile iletişim kurulamadı.' });
  }
};

// 10. YENİ: TEKLİFİ VERİTABANINDAN KALICI OLARAK SİLME
export const deleteProposal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Sadece teklifin sahibi (user) silebilir
    const proposal = await Proposal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id 
    });

    if (!proposal) {
      res.status(404).json({ message: 'Teklif bulunamadı veya silmeye yetkiniz yok.' });
      return;
    }

    res.json({ message: 'Teklif veritabanından başarıyla silindi.' });
  } catch (error: any) {
    console.error("Silme işlemi hatası:", error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// 11. YENİ: TEKLİFİ SABİTLEME (RAPTİYE)
export const togglePinProposal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const proposal = await Proposal.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!proposal) {
      res.status(404).json({ message: 'Teklif bulunamadı.' });
      return;
    }

    // Mevcut durumun tam tersine çevir (True ise False, False ise True yap)
    proposal.isPinned = !proposal.isPinned;
    await proposal.save();

    res.json({ message: 'Sabitleme durumu güncellendi.', isPinned: proposal.isPinned });
  } catch (error: any) {
    console.error("Sabitleme hatası:", error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};