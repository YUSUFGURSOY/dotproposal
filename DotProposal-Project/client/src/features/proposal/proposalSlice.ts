// src/features/proposal/proposalSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Geçmişteki bir teklifin veri yapısı
export interface ProposalRecord {
  id: string;
  date: string;
  clientName: string;
  projectDescription: string;
  totalPrice: number;
  items: string[];
}

// 👇 YENİ: Eğittiğimiz AI Modelinden gelen analiz verisi tipi
export interface AIAnalysisData {
  budget: number;
  hours: number;
}

interface ProposalState {
  step: number;
  clientName: string;
  projectDescription: string;
  generatedItems: string[];
  totalPrice: number;
  loading: boolean;
  history: ProposalRecord[]; 
  // RabbitMQ asenkron takibi için
  proposalId: string | null;
  status: 'idle' | 'pending' | 'completed' | 'error';
  // 👇 YENİ EKLENEN ALAN
  aiAnalysis: AIAnalysisData | null;
}

const initialState: ProposalState = {
  step: 0,
  clientName: '',
  projectDescription: '',
  generatedItems: [],
  totalPrice: 0,
  loading: false,
  history: [], 
  proposalId: null,
  status: 'idle',
  // 👇 YENİ: Başlangıçta boş
  aiAnalysis: null,
};

export const proposalSlice = createSlice({
  name: 'proposal',
  initialState,
  reducers: {
    nextStep: (state) => { state.step += 1; },
    prevStep: (state) => { state.step -= 1; },
    
    setProposalData: (state, action: PayloadAction<{ field: string; value: string | number | boolean | string[] }>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (state as any)[action.payload.field] = action.payload.value;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => { state.loading = action.payload; },
    
    setAIResults: (state, action: PayloadAction<{ items: string[]; price: number }>) => {
      state.generatedItems = action.payload.items;
      state.totalPrice = action.payload.price;
    },

    // Backend'den ID geldiğinde ve durum değiştiğinde çağrılacak
    setProposalId: (state, action: PayloadAction<string | null>) => {
      state.proposalId = action.payload;
    },
    setProposalStatus: (state, action: PayloadAction<'idle' | 'pending' | 'completed' | 'error'>) => {
      state.status = action.payload;
      
      // 👇 SİHİRLİ DOKUNUŞ: Eğer yeni bir analiz başlıyorsa (pending), eski analiz verilerini temizleyelim
      if (action.payload === 'pending') {
        state.aiAnalysis = null;
      }
    },

    // 👇 YENİ: Backend'den gelen AI analiz sonuçlarını (Bütçe ve Saat) kaydetmek için
    setAIAnalysis: (state, action: PayloadAction<AIAnalysisData | null>) => {
      state.aiAnalysis = action.payload;
    },

    // Mevcut teklifi geçmişe kaydet ve sihirbazı sıfırlama
    saveProposalToHistory: (state) => {
      const newRecord: ProposalRecord = {
        id: Date.now().toString(), // Benzersiz ID
        date: new Date().toLocaleDateString('tr-TR'),
        clientName: state.clientName,
        projectDescription: state.projectDescription,
        totalPrice: state.totalPrice,
        items: state.generatedItems
      };
      
      state.history.push(newRecord);
      
      // Sihirbazı sıfırlayalım ki yeni teklife hazır olsun
      state.step = 0;
      state.clientName = '';
      state.projectDescription = '';
      state.generatedItems = [];
      state.totalPrice = 0;
      
      // Geçmişe kaydettikten sonra asenkron durumu ve AI analizini de sıfırla
      state.proposalId = null;
      state.status = 'idle';
      state.aiAnalysis = null; // 👇 ANALİZİ DE TEMİZLE
    },

    // Geçmişten teklif silme
    deleteProposal: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter(p => p.id !== action.payload);
    }
  },
});

export const { 
  nextStep, 
  prevStep, 
  setProposalData, 
  setLoading, 
  setAIResults, 
  saveProposalToHistory, 
  deleteProposal,
  setProposalId,     
  setProposalStatus,
  setAIAnalysis // 👇 DIŞARIYA AÇTIK
} = proposalSlice.actions;

export default proposalSlice.reducer;