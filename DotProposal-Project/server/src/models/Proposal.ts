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
  selectedFeatures: string[]; // Örn: ["SEO", "Mobil Uyum"]
  hourlyRate?: string;        // Örn: "50"
  selectedSections: string[]; // Örn: ["ozet", "takvim"]
  
  createdAt: Date;
  updatedAt: Date;
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
  
  // ✅ YENİ ALANLARIN ŞEMALARI
  selectedFeatures: {
    type: [String], // String Dizisi
    default: []
  },
  hourlyRate: {
    type: String,   // Opsiyonel
    default: ''
  },
  selectedSections: {
    type: [String], // String Dizisi
    default: []
  }

}, {
  timestamps: true
});

// 2. Modeli Interface ile birlikte export ediyoruz
export default mongoose.model<IProposal>('Proposal', proposalSchema);