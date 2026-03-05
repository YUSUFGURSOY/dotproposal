// server/src/services/proposalService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import User from '../models/User';
import Proposal from '../models/Proposal';
import { buildProposalPrompt } from '../utils/promptBuilder'; // YENİ EKLENDİ

export interface CreateProposalData {
  jobTitle: string;
  jobDescription: string;
  companyName?: string;
  tone?: string;
  selectedFeatures?: string[];
  hourlyRate?: string;
  selectedSections?: string[];
}

export const generateProposalService = async (userId: string, data: CreateProposalData) => {
  const pdf = require('pdf-parse-fork');

  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Sunucu hatası: API Anahtarı yapılandırılmamış.");
  }
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // 1. Kullanıcıyı ve CV'yi bul
  const user = await User.findById(userId);
  if (!user || !user.cvFileName) {
    throw new Error('Lütfen önce profilinizden bir CV yükleyin.'); 
  }

  const cvPath = path.join(__dirname, '../../uploads', user.cvFileName);
  let cvText = '';
  if (fs.existsSync(cvPath)) {
    const dataBuffer = fs.readFileSync(cvPath);
    const pdfData = await pdf(dataBuffer);
    cvText = pdfData.text.replace(/\n/g, " ").replace(/\s+/g, " ").trim().substring(0, 8000);
  } else {
    throw new Error('CV dosyası sunucuda bulunamadı.');
  }

  console.log("✅ Veriler Hazır, DotProposal Teklifi Oluşturuyor...");

  // 2. Utils dosyamızdan dinamik prompt'u alıyoruz (KOD BURADA ÇOK SADELEŞTİ)
  const prompt = buildProposalPrompt({
    cvText,
    jobTitle: data.jobTitle,
    jobDescription: data.jobDescription,
    companyName: data.companyName,
    tone: data.tone,
    selectedFeatures: data.selectedFeatures,
    hourlyRate: data.hourlyRate,
    selectedSections: data.selectedSections
  });

  // 3. Gemini'ye İstek At
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const aiGeneratedLetter = response.text();

  if (!aiGeneratedLetter) {
    throw new Error("Gemini teklif oluşturamadı.");
  }

  // 4. Veritabanına Kaydet ve Döndür
  const proposal = await Proposal.create({
    user: userId,
    jobTitle: data.jobTitle,
    jobDescription: data.jobDescription,
    companyName: data.companyName || 'Belirtilmemiş',
    tone: data.tone || 'Professional',
    selectedFeatures: data.selectedFeatures || [],
    hourlyRate: data.hourlyRate || '',
    selectedSections: data.selectedSections || [],
    generatedCoverLetter: aiGeneratedLetter
  });

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