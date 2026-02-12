
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

interface ProposalState {
  step: number;
  clientName: string;
  projectDescription: string;
  generatedItems: string[];
  totalPrice: number;
  loading: boolean;
  history: ProposalRecord[]; // YENİ: Geçmiş teklifler listesi
}

const initialState: ProposalState = {
  step: 0,
  clientName: '',
  projectDescription: '',
  generatedItems: [],
  totalPrice: 0,
  loading: false,
  history: [], 
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
    },

    // Geçmişten teklif silme
    deleteProposal: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter(p => p.id !== action.payload);
    }
  },
});

export const { nextStep, prevStep, setProposalData, setLoading, setAIResults, saveProposalToHistory, deleteProposal } = proposalSlice.actions;
export default proposalSlice.reducer;