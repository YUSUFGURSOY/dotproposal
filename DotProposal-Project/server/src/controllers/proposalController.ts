// server/src/controllers/proposalController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Proposal from '../models/Proposal';
import User from '../models/User';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. TEKLİF OLUŞTURMA FONKSİYONU
export const createProposal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pdf = require('pdf-parse-fork');
    
    // API Anahtarın
    const MY_API_KEY = "AIzaSyA5sKKBXgH6npJ_Krw1R6Dr96hWwWs7vOU";

    const genAI = new GoogleGenerativeAI(MY_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Frontend'den gelen veriler
    const { 
        jobTitle, jobDescription, companyName, tone, 
        selectedFeatures, hourlyRate, selectedSections 
    } = req.body;

    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user || !user.cvFileName) {
       res.status(400).json({ message: 'Lütfen önce profilinizden bir CV yükleyin.' });
       return;
    }

    const cvPath = path.join(__dirname, '../../uploads', user.cvFileName);
    
    let cvText = '';
    if (fs.existsSync(cvPath)) {
      const dataBuffer = fs.readFileSync(cvPath);
      const data = await pdf(dataBuffer); 
      cvText = data.text;
      cvText = cvText.replace(/\n/g, " ").replace(/\s+/g, " ").trim().substring(0, 8000);
    } else {
       res.status(404).json({ message: 'CV dosyası sunucuda bulunamadı.' });
       return;
    }

    console.log("✅ Veriler Hazır, DotProposal Teklifi Oluşturuyor...");

    // Özellikleri metne çevir
    const featuresText = selectedFeatures && selectedFeatures.length > 0 
        ? selectedFeatures.join(', ') 
        : "Standart modern proje gereksinimleri";

    // Rapor Bölümleri
    const allSectionsDefinition: any = {
        "ozet": "1. **Yönetici Özeti (Executive Summary):**\n- Müşterinin ihtiyacını anladığını gösteren kısa bir özet.\n- Freelancer'ın bu iş için neden en doğru kişi olduğunu CV'sindeki yeteneklerle bağdaştırarak açıkla.",
        "cozum": `2. **Çözüm Önerisi ve Teknik Yaklaşım:**\n- Projenin nasıl geliştirileceğini anlat.\n- Özellikle şu özelliklerin projeye nasıl entegre edileceğinden bahset: **${featuresText}**.\n- Hangi teknolojilerin kullanılacağını belirt.`,
        "kapsam": "3. **Kapsam ve İş Kalemleri (Scope of Work):**\n- Projeyi modüllere böl (Frontend, Backend, Veritabanı vb.).\n- Her modül için tahmini bir süre (saat veya gün) belirt.",
        "rakip": "4. **Rakip ve Pazar Analizi (Competitor Analysis):**\n- Bu tür projelerin piyasadaki genel standartlarından bahset.\n- Rakiplere kıyasla bu teklifin sunduğu avantajları vurgula.",
        "takvim": "5. **Proje Takvimi (Timeline):**\n- İşin başlangıçtan bitişe tahmini ne kadar süreceğini özetle."
    };

    // Boş gelirse hepsi, dolu gelirse seçilenler
    const sectionsToInclude = (selectedSections && selectedSections.length > 0) 
        ? selectedSections 
        : Object.keys(allSectionsDefinition); 

    let dynamicPromptContent = "";
    sectionsToInclude.forEach((key: string) => {
        if (allSectionsDefinition[key]) {
            dynamicPromptContent += allSectionsDefinition[key] + "\n\n";
        }
    });

    // Fiyat Hesaplama
    let priceInstruction = "NOT: Fiyat bilgisi verme, sadece 'Efor/Süre' tahmini yap.";
    
    if (hourlyRate && Number(hourlyRate) > 0) {
        priceInstruction = `
        ⭐ **FİYAT HESAPLAMASI (ÖNEMLİ):**
        Freelancer'ın saatlik ücreti: **${hourlyRate} Para Birimi**.
        Lütfen "Kapsam ve İş Kalemleri" bölümünde çıkardığın toplam tahmini saati, bu saatlik ücretle çarp.
        Raporun EN SONUNA **"💰 Tahmini Bütçe"** başlığı ekle ve şu formatta yaz:
        * **Tahmini Toplam Süre:** [X] Saat
        * **Saatlik Ücret:** ${hourlyRate}
        * **Toplam Proje Bedeli:** [X * ${hourlyRate}] (Hesaplamayı yapıp sonucu yaz)
        `;
    }

    // Prompt
    const prompt = `
      Sen DotProposal sisteminin yapay zeka motorusun. Uzmanlık alanın YALNIZCA Yazılım, Bilişim, Web Tasarım, Veri Bilimi ve Teknoloji projeleridir.

      GİRDİLER:
      - Freelancer (Kullanıcı) Bilgileri ve Yetkinlikleri (CV'den): ${cvText}
      - Müşterinin İstediği Proje (İş Tanımı): ${jobDescription}
      - Proje Başlığı: ${jobTitle}
      - Müşteri/Şirket Adı: ${companyName}
      - Teklif Tonu: ${tone} (Örn: Resmi, İkna Edici, Teknik)

      🚨 KRİTİK KARAR MEKANİZMASI (ÖNCE BUNU KONTROL ET):
      Müşterinin girdiği "İş Tanımı"nı analiz et. Bu iş yazılım, teknoloji, tasarım veya dijital hizmetlerle ilgili mi?

      🛑 HAYIR (Örn: İnşaat, Yemek, Temizlik, Nakliye, Hukuk vb.):
      Eğer iş teknoloji dışındaysa, ASLA teklif hazırlama. Sadece aşağıdaki gibi kısa bir RET mesajı döndür:

      # ⛔ Hizmet Kapsamı Dışı
      Üzgünüm, DotProposal yapay zeka sistemi **yalnızca yazılım ve teknoloji** odaklı projeler için teklif hazırlayabilir.
      Girdiğiniz proje tanımı sistemimizin uzmanlık alanı dışındadır.

      ✅ EVET (Yazılım/Teknoloji ile ilgili):
      Eğer proje teknoloji ile ilgiliyse, aşağıdaki başlıkları içeren, Markdown formatında, detaylı ve profesyonel raporu oluştur:

      ${dynamicPromptContent}

      ${priceInstruction}

      Çıktı dili Türkçe olsun. Markdown formatını düzgün kullan (# ## - gibi).
    `;

    // AI Çağrısı
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiGeneratedLetter = response.text();

    if (!aiGeneratedLetter) {
        throw new Error("Gemini teklif oluşturamadı.");
    }

    // Kaydet
    const proposal = await Proposal.create({
      user: userId,
      jobTitle,
      jobDescription,
      companyName: companyName || 'Belirtilmemiş',
      tone: tone || 'Professional',
      generatedCoverLetter: aiGeneratedLetter 
    } as any);

    res.status(201).json(proposal);

  } catch (error: any) {
    console.error("❌ HATA DETAYI:", error);
    res.status(500).json({ 
      message: 'Teklif oluşturulurken bir hata oluştu.',
      error: error.message 
    });
  }
};

// 2. TÜM TEKLİFLERİ LİSTELEME
export const getMyProposals = async (req: AuthRequest, res: Response) => {
  try {
    const proposals = await Proposal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: 'Teklifler alınamadı.' });
  }
};

// 3. TEK BİR TEKLİFİ DETAYLI GETİRME
export const getProposalById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const proposal = await Proposal.findOne({ 
          _id: req.params.id, 
          user: req.user._id 
      });
  
      if (!proposal) {
          res.status(404).json({ message: 'Teklif bulunamadı.' });
          return;
      }
  
      res.json(proposal);
    } catch (error) {
      console.error("Teklif detayı hatası:", error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
};