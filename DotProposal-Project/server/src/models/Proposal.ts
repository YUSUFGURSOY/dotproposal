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
  dealStatus: string;
  clientFeedbackDate?: Date;   
  isClientFeedbackRead?: boolean;
  
  // ✅ YENİ EKLENEN ALANLAR (Sihirbazdaki kutucuklar ve fiyat için)
  selectedFeatures: string[];
  hourlyRate?: string;        
  selectedSections: string[]; 
  
  createdAt: Date;
  updatedAt: Date;
  aiInsights: string[];
  
  isViewed: boolean;
  viewedAt?: Date;
  clientFeedback?: string;
  
  // 👇 YENİ: Raptiye (Sabitleme) özelliği için eklendi
  isPinned?: boolean; 
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
  isViewed: { 
    type: Boolean, 
    default: false 
  },
  viewedAt: { 
    type: Date 
  },
  dealStatus: {
    type: String,
    enum: ['Taslak', 'İletildi', 'Kabul Edildi', 'Reddedildi'],
    default: 'Taslak'
  },
  clientFeedback: {
    type: String,
    default: ''
  },
  clientFeedbackDate: { 
    type: Date 
  },            
  isClientFeedbackRead: { 
    type: Boolean, default: false 
  },
  // 👇 YENİ: Raptiye varsayılan olarak kapalı gelsin
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 2. Modeli Interface ile birlikte export ediyoruz
export default mongoose.model<IProposal>('Proposal', proposalSchema);