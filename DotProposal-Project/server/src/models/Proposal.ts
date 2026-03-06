// server/src/models/Proposal.ts
import mongoose, { Schema, Document } from 'mongoose';

// 1. TypeScript için Interface tanımlıyoruz
export interface IProposal extends Document {
  user: mongoose.Types.ObjectId;
  jobTitle: string;
  jobDescription: string;
  generatedCoverLetter: string;
  companyName: string;
  tone: string;
  
  // ✅ YENİ EKLENEN ALANLAR (Sihirbazdaki kutucuklar ve fiyat için)
  selectedFeatures: string[];
  hourlyRate?: string;        
  selectedSections: string[]; 
  
  createdAt: Date;
  updatedAt: Date;
  aiInsights: string[];
  
  // 👇 BUNLAR BURADA DOĞRU, ELLERİNE SAĞLIK
  isViewed: boolean;
  viewedAt?: Date;
}

const proposalSchema = new Schema<IProposal>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobTitle: {
    type: String,
    required: [true, 'Lütfen bir iş başlığı girin'],
  },
  jobDescription: {
    type: String,
    required: true,
  },
  generatedCoverLetter: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    default: 'Bilinmeyen Şirket',
  },
  tone: {
    type: String,
    default: 'Professional',
  },
  aiInsights: { 
    type: [String], 
    default: [] 
  },
  selectedFeatures: {
    type: [String], 
    default: []
  },
  hourlyRate: {
    type: String,   
    default: ''
  },
  selectedSections: {
    type: [String], 
    default: []
  },
  
  // 👇 İŞTE EKSİK OLAN KISIM BURASIYDI! BUNLARI ŞEMAYA EKLEDİK:
  isViewed: { 
    type: Boolean, 
    default: false 
  },
  viewedAt: { 
    type: Date 
  }

}, {
  timestamps: true
});

// 2. Modeli Interface ile birlikte export ediyoruz
export default mongoose.model<IProposal>('Proposal', proposalSchema);