// server/src/Service/proposalService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import User from '../models/User';
import Proposal from '../models/Proposal';
import { buildProposalPrompt } from '../utils/promptBuilder'; 
// 👇 YENİ EKLENDİ: Gemini çeviri fonksiyonu import ediliyor
import { getEnglishKeywordsForAI } from '../utils/translateKeywords';

export interface CreateProposalData {
  jobTitle: string;
  jobDescription: string;
  companyName?: string;
  tone?: string;
  selectedFeatures?: string[];
  hourlyRate?: string;
  selectedSections?: string[];
}

export const generateProposalService = async (userId: string, data: CreateProposalData, proposalId: string, aiEstimatedBudget?: number, aiEstimatedHours?: number) => {
  const pdf = require('pdf-parse-fork');

  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Sunucu hatası: API Anahtarı yapılandırılmamış.");
  }
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" } 
  });

  const user = await User.findById(userId);
  if (!user || !user.cvFileName) {
    throw new Error('Lütfen önce profilinizden bir CV yükleyin.'); 
  }

  // CLOUDINARY'DEN PDF İNDİRME VE OKUMA MANTIĞI
  let cvText = '';
  try {
    const cvUrl = user.cvFileName; // Artık cvFileName içinde "https://res.cloudinary.com/..." yazıyor
    
    // axios ile internetten (Cloudinary'den) PDF'i "arraybuffer" (ham veri) olarak indiriyoruz
    const response = await axios.get(cvUrl, { responseType: 'arraybuffer' });
    const dataBuffer = Buffer.from(response.data, 'binary');
    
    // İndirilen ham veriyi pdf-parse'a verip metne çeviriyoruz
    const pdfData = await pdf(dataBuffer);
    cvText = pdfData.text.replace(/\n/g, " ").replace(/\s+/g, " ").trim().substring(0, 8000);
    
    console.log("✅ CV başarıyla Cloudinary'den indirilip okundu!");
  } catch (error) {
    console.error("Buluttan CV Okuma Hatası:", error);
    throw new Error('CV dosyası buluttan okunamadı. Lütfen profilinizden CV\'nizi tekrar yükleyin.');
  }

  // GITHUB CANLI VERİSİ ÇEKİMİ (Aynı kaldı)
  if (user.githubLink) {
    try {
      const username = user.githubLink.split('/').filter(Boolean).pop();
      if (username) {
        const { data: repos } = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=3`, {
          headers: { 'User-Agent': 'DotProposal-App' } 
        });
        
        if (repos && repos.length > 0) {
           const githubDataText = repos.map((r: any) => `- ${r.name}: ${r.description || 'Açıklama yok.'} (Kullanılan Dil: ${r.language || 'Belirtilmemiş'})`).join('\n');
           cvText += `\n\n--- GELİŞTİRİCİNİN GÜNCEL GITHUB AKTİFLİĞİ (CANLI KANIT) ---\n${githubDataText}\n(Yapay Zeka Talimatı: Lütfen teklifi yazarken geliştiricinin becerilerini kanıtlamak için yukarıdaki canlı GitHub güncel projelerini profesyonelce teklifin içine referans olarak yedir.)`;
           console.log("✅ GitHub canlı verisi çekildi ve CV'ye eklendi!");
        }
      }
    } catch (err) {
      console.error("GitHub verisi çekilemedi, normal CV ile devam ediliyor...", err);
    }
  }

  console.log("✅ Veriler Hazır, DotProposal Teklifi Oluşturuyor...");

  // Utils dosyamızdan dinamik prompt'u alıyoruz
  const prompt = buildProposalPrompt({
    cvText,
    jobTitle: data.jobTitle,
    jobDescription: data.jobDescription,
    companyName: data.companyName,
    tone: data.tone,
    selectedFeatures: data.selectedFeatures,
    hourlyRate: data.hourlyRate,
    selectedSections: data.selectedSections,
    aiEstimatedBudget,
    aiEstimatedHours
  });

  // Gemini'ye İstek At
  const result = await model.generateContent(prompt);
  const aiResponse = await result.response;
  const rawText = aiResponse.text();

  if (!rawText) {
    throw new Error("Gemini teklif oluşturamadı.");
  }

  let aiData;
  try {
    aiData = JSON.parse(rawText);
  } catch (error) {
    console.error("JSON Çeviri Hatası:", error);
    throw new Error("Yapay zeka uygun formatta cevap veremedi.");
  }

  const proposal = await Proposal.findByIdAndUpdate(
    proposalId,
    {
      companyName: data.companyName || 'Belirtilmemiş',
      tone: data.tone || 'Professional',
      selectedFeatures: data.selectedFeatures || [],
      hourlyRate: data.hourlyRate || '',
      selectedSections: data.selectedSections || [],
      generatedCoverLetter: aiData.coverLetter, 
      aiInsights: aiData.aiInsights || [], 
      status: 'completed'
    },
    { new: true }
  );

  return proposal;
};

export const getAllUserProposalsService = async (userId: string) => {
  return await Proposal.find({ user: userId }).sort({ createdAt: -1 });
};

export const getProposalByIdService = async (proposalId: string, userId: string) => {
  const proposal = await Proposal.findOne({ _id: proposalId, user: userId });
  if (!proposal) throw new Error('Teklif bulunamadı.');
  return proposal;
};

// 👇 YENİ EKLENDİ: Fiyat Tahmini ve Çeviri Servisi
export const getPricePrediction = async (projectDescription: string) => {
    try {
        // 1. Türkçe/Karışık metni Gemini ile İngilizce anahtar kelimelere çevir
        const englishKeywords = await getEnglishKeywordsForAI(projectDescription);
        console.log("Python'a gönderilen optimize edilmiş kelimeler:", englishKeywords);

        // 2. Python (FastAPI) servisine sadece bu İngilizce kelimeleri gönder
        // (Eğer Python sunucunu Render'a taşıdıysan buradaki localhost adresini canlı adresinle değiştirmelisin)
        const pythonResponse = await axios.post('https://dotproposal-ai.onrender.com/predict-budget', {
            title: englishKeywords 
        });

        // 3. Tahmin edilen fiyatı geri dön
        return pythonResponse.data.predicted_price;

    } catch (error) {
        console.error("Fiyat tahmini alınırken hata:", error);
        throw error;
    }
};