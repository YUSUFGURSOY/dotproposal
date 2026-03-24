// server/src/controllers/proposalController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as proposalService from '../Service/proposalService';
import Proposal from '../models/Proposal';      
import User from '../models/User'; 
import { sendEmail } from '../utils/sendEmail'; 
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios'; 
import dotenv from 'dotenv'; 
dotenv.config();

// 1. TEKLİF OLUŞTURMA FONKSİYONU 
export const createProposal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { jobTitle, jobDescription } = req.body; 

    // 👇 1. ADIM: KENDİ EĞİTTİĞİN MODELİ ÇAĞIR (MİKROSERVİS KÖPRÜSÜ)
    let aiEstimatedBudget = 0;
    let aiEstimatedHours = 0;

  try {
      // 1. Önce metinleri birleştir
      const combinedText = `${jobTitle || ''} ${jobDescription || ''}`.trim();
      
      // 2. Loga birleştirilmiş metni yazdır ki ne gönderdiğini gör
      console.log(`\n[AI-RADAR] Çeviri ve Python servisine istek atılıyor. Gönderilen Metin: ${combinedText || 'Yok'}`);
      
      // 3. YENİ KOD: Doğrudan axios.post yerine, yazdığımız servisi çağırıyoruz.
      // Bu servis önce Gemini ile çeviri yapacak, sonra Python'a gönderecek.
      const predictedResponse = await proposalService.getPricePrediction(combinedText);

      console.log("🚨 PİTONDAN GELEN HAM CEVAP:", predictedResponse);
      
      // Servis nesne dönüyorsa (success, suggested_budget) veya direkt sayı dönüyorsa yakala
   // Python'dan dönen veriyi doğrudan yakalıyoruz
      if (predictedResponse && typeof predictedResponse === 'object') {
        
        // Python'dan gelen "budget" değerini al
        const rawBudget = predictedResponse.budget || predictedResponse.suggested_budget || 0;
        
        // 🛡️ KALKAN: Gelen veriyi kesinlikle sayıya (Number) çevir
        aiEstimatedBudget = Number(rawBudget) || 0;
        console.log(`[AI-RADAR] İşlenmiş Bütçe: $${aiEstimatedBudget}`);

        // 👇 2. ADIM: SENİN "SİHİRLİ SAAT" ALGORİTMAN (HİBRİD ZEKA)
        const user = await User.findById(userId);
        const userHourlyRate = Number(user?.hourlyRate) || 0;
        console.log(`[AI-RADAR] Kullanıcı Saatlik Ücreti: $${userHourlyRate}`);

        if (userHourlyRate > 0 && aiEstimatedBudget > 0) {
          aiEstimatedHours = Math.ceil(aiEstimatedBudget / userHourlyRate);
        } else {
          // Eğer bütçe varsa ama kullanıcının saatlik ücreti yoksa en az 1 saat yaz
          aiEstimatedHours = aiEstimatedBudget > 0 ? 1 : 0;
        }
        console.log(`[AI-RADAR] Hesaplanmış Efor: ${aiEstimatedHours} Saat`);
      }
    } catch (aiPredictError: any) {
      console.error("[AI-RADAR] ❌ Python Servis Bağlantı Hatası:", aiPredictError.message);
      if(aiPredictError.response) {
         console.error("[AI-RADAR] Detaylı Hata:", aiPredictError.response.data);
      }
    }

    // 1. Veritabanında "pending" (bekliyor) durumunda bir taslak kayıt oluştur
    const newProposal = new Proposal({
      user: userId,
      status: 'pending', 
      jobTitle: jobTitle || 'Taslak İş Başlığı', 
      jobDescription: jobDescription || 'Taslak İş Açıklaması',
      generatedCoverLetter: 'Yapay zeka teklifinizi hazırlıyor, lütfen bekleyin...', 
      
      aiAnalysis: {
        budget: aiEstimatedBudget,
        hours: aiEstimatedHours
      },
      
      createdAt: new Date()
    });
    
    await newProposal.save();

    // 👇 YENİ: SENKRON İŞLEME (KÖPRÜ BURADA TAMAMLANDI)
    try {
        await proposalService.generateProposalService(userId, req.body, newProposal._id.toString(), aiEstimatedBudget, aiEstimatedHours);
        
        res.status(200).json({
          message: 'Teklifiniz başarıyla oluşturuldu!',
          proposalId: newProposal._id,
          aiAnalysis: {
            budget: aiEstimatedBudget,
            hours: aiEstimatedHours
          }
        });
    } catch (aiError: any) {
        console.error("Yapay Zeka (Doğrudan) İşlem Hatası:", aiError);
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

// ... Geri Kalan Fonksiyonlar Tamamen Aynı Bırakıldı ...

export const getMyProposals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const proposals = await proposalService.getAllUserProposalsService(req.user._id);
    res.json(proposals);
  } catch (error: any) {
    res.status(500).json({ message: 'Teklifler alınamadı.' });
  }
};

export const getProposalById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const proposal = await proposalService.getProposalByIdService(req.params.id, req.user._id);
      res.json(proposal);
    } catch (error: any) {
      console.error("Teklif detayı hatası:", error);
      res.status(404).json({ message: error.message || 'Sunucu hatası.' });
    }
};

export const getPublicProposalById = async (req: Request, res: Response): Promise<void> => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      res.status(404).json({ message: 'Teklif bulunamadı veya silinmiş.' });
      return;
    }

    if (!proposal.isViewed) {
      proposal.isViewed = true;
      proposal.viewedAt = new Date();
      await proposal.save();
    }

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

export const updateDealStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dealStatus } = req.body;
    const validStatuses = ['Taslak', 'İletildi', 'Kabul Edildi', 'Reddedildi'];
    if (!validStatuses.includes(dealStatus)) {
      res.status(400).json({ message: 'Geçersiz statü.' });
      return;
    }

    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
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

export const addClientFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { feedback } = req.body;
    const proposal = await Proposal.findById(req.params.id).populate('user', 'name email');

    if (!proposal) {
      res.status(404).json({ message: 'Teklif bulunamadı.' });
      return;
    }

    proposal.clientFeedback = feedback;
    proposal.clientFeedbackDate = new Date();
    proposal.isClientFeedbackRead = false;
    await proposal.save();

    const user: any = proposal.user;
    if (user && user.email) {
      const message = `Merhaba ${user.name},\n\n"${proposal.jobTitle}" başlıklı projeniz için müşterinizden yeni bir mesaj geldi!\n\nMesaj Detayı:\n"${feedback}"\n\nLütfen DotProposal paneline girerek mesajı kontrol edin ve müşterinize dönüş yapın.\n\nİyi çalışmalar,\nDotProposal Bildirim Sistemi`;
      
      sendEmail({
        email: user.email,
        subject: '💬 Yeni Mesaj Var! - DotProposal',
        message: message,
      }).catch((emailError) => {
        console.error('Arka planda e-posta gönderilemedi:', emailError);
      });
    }

    res.status(200).json({ message: 'Geri bildirim başarıyla iletildi.' });
    
  } catch (error: any) {
    console.error("Geri bildirim kaydetme hatası:", error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

export const markFeedbackAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isClientFeedbackRead: true },
      { new: true }
    );
    res.json({ message: 'Mesaj okundu olarak işaretlendi.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

export const updateProposal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { generatedCoverLetter } = req.body;
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { generatedCoverLetter },
      { new: true }
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

export const enhanceProposalText = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text, instruction } = req.body;
    if (!text) {
      res.status(400).json({ message: 'Lütfen düzenlenecek bir metin sağlayın.' });
      return;
    }
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

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

export const deleteProposal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
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

export const togglePinProposal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const proposal = await Proposal.findOne({ _id: req.params.id, user: req.user._id });
    if (!proposal) {
      res.status(404).json({ message: 'Teklif bulunamadı.' });
      return;
    }
    proposal.isPinned = !proposal.isPinned;
    await proposal.save();
    res.json({ message: 'Sabitleme durumu güncellendi.', isPinned: proposal.isPinned });
  } catch (error: any) {
    console.error("Sabitleme hatası:", error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};