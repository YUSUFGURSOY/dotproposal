/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../app/store';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import ReactMarkdown from 'react-markdown'; 


import { 
  nextStep, 
  prevStep, 
  setProposalData, 
  setLoading, 
  saveProposalToHistory,
  setProposalId,
  setProposalStatus
} from '../features/proposal/proposalSlice';
import { 
    Paper, Button, Typography, TextField, Box, 
    CircularProgress, Divider, FormGroup, FormControlLabel, Checkbox, InputAdornment,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'; 
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';   
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'; 
import { useTranslation } from 'react-i18next';
import { createTheme, ThemeProvider, styled, keyframes } from '@mui/material/styles';

// ─── CUSTOM THEME ──────────────────────────────────────────────────────────────

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6C78D6', light: '#A3ADF0', dark: '#7B529E' },
    secondary: { main: '#7B529E', light: '#B282D6' },
    background: { default: '#6773D4', paper: 'rgba(255,255,255,0.15)' },
    text: { primary: '#FFFFFF', secondary: 'rgba(255,255,255,0.7)' },
  },
  typography: {
    fontFamily: '"Sora", "Segoe UI", sans-serif',
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: '#F0F4FF', // Fotoğraftaki gibi beyaz/açık renk input
            borderRadius: 8,
            transition: 'all 0.25s ease',
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: 'rgba(108,120,214,0.4)' },
            '&.Mui-focused fieldset': { borderColor: '#6C78D6', borderWidth: 1.5 },
          },
          '& .MuiInputLabel-root': { color: '#666666' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#6C78D6' },
          '& .MuiOutlinedInput-input': { color: '#222222' }, // Açık zemin üzerine koyu yazı
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: { color: 'rgba(255,255,255,0.5)', '&.Mui-checked': { color: '#6C78D6' } },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: 'rgba(255,255,255,0.15)' } },
    },
  },
});

// ─── ANIMATIONS ────────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulseRing = keyframes`
  0%   { transform: scale(0.95); opacity: 0.6; }
  50%  { transform: scale(1.08); opacity: 0.15; }
  100% { transform: scale(0.95); opacity: 0.6; }
`;

const rotateSlow = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;



// ─── STYLED COMPONENTS ────────────────────────────────────────────────────────
const PageWrapper = styled(Box)({
  minHeight: '100vh',
  // Fotoğraftaki ana arkaplan gradyanı (Maviden mora)
  background: 'linear-gradient(135deg, #6773d4 0%, #7e529d 100%)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '40px 16px 80px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: '-30%', left: '-20%',
    width: '60%', height: '60%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'fixed',
    bottom: '-20%', right: '-15%',
    width: '50%', height: '50%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
});

const GlassCard = styled(Paper)({
  // Fotoğraftaki belirgin transparan kart görünümü
  background: 'rgba(255,255,255,0.15)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 24,
  padding: '40px 44px',
  boxShadow: '0 8px 64px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
  width: '100%',
  maxWidth: 760,
  animation: `${fadeUp} 0.5s ease both`,
});

const GradientTitle = styled(Typography)({
  background: 'linear-gradient(135deg, #ffffff 0%, #e8ebff 50%, #A3ADF0 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 700,
  letterSpacing: '-0.02em',
});

const StyledStep = styled(Box)<{ active?: string; completed?: string }>(({ active, completed }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  flex: 1,
  // Örnek kullanım:
  opacity: active === 'true' ? 1 : 0.5,
  color: completed === 'true' ? 'green' : 'inherit',
}));
const StepCircle = styled(Box)<{ active?: number; completed?: number }>(({ active, completed }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  fontWeight: 700,
  fontFamily: '"Sora", sans-serif',
  transition: 'all 0.35s cubic-bezier(.34,1.56,.64,1)',
  ...(completed ? {
    background: 'linear-gradient(135deg, #6C78D6, #7B529E)',
    color: '#fff',
    boxShadow: '0 0 20px rgba(108,120,214,0.5)',
    transform: 'scale(1.05)',
  } : active ? {
    background: 'rgba(255,255,255,0.2)',
    border: '2px solid #6C78D6',
    color: '#fff',
    boxShadow: '0 0 0 6px rgba(108,120,214,0.15)',
  } : {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.5)',
  }),
}));

const FeatureChip = styled(FormControlLabel)<{ checked?: boolean }>(({ checked }) => ({
  margin: 0,
  padding: '6px 12px',
  borderRadius: 10,
  border: checked ? '1px solid rgba(108,120,214,0.6)' : '1px solid rgba(255,255,255,0.15)',
  background: checked ? 'rgba(108,120,214,0.2)' : 'rgba(255,255,255,0.05)',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  width: 'calc(50% - 6px)',
  '&:hover': {
    border: '1px solid rgba(108,120,214,0.4)',
    background: 'rgba(108,120,214,0.1)',
  },
}));

const PrimaryButton = styled(Button)({
  // Fotoğraftaki buton gradyanı
  background: 'linear-gradient(90deg, #6C78D6 0%, #7B529E 100%)',
  color: '#fff',
  borderRadius: 8,
  padding: '11px 28px',
  fontFamily: '"Sora", sans-serif',
  fontWeight: 600,
  fontSize: 14,
  letterSpacing: '0.01em',
  textTransform: 'none',
  boxShadow: '0 4px 24px rgba(108,120,214,0.35)',
  transition: 'all 0.25s ease',
  '&:hover': {
    background: 'linear-gradient(90deg, #7b88df 0%, #8d62af 100%)',
    boxShadow: '0 6px 32px rgba(108,120,214,0.5)',
    transform: 'translateY(-1px)',
  },
  '&:disabled': {
    background: 'rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.4)',
    boxShadow: 'none',
  },
});

const SecondaryButton = styled(Button)({
  background: 'rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.9)',
  borderRadius: 8,
  padding: '11px 24px',
  fontFamily: '"Sora", sans-serif',
  fontWeight: 500,
  fontSize: 14,
  textTransform: 'none',
  border: '1px solid rgba(255,255,255,0.2)',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.3)',
    color: '#fff',
  },
  '&:disabled': {
    opacity: 0.3,
  },
});

const OutlineButton = styled(Button)({
  background: 'transparent',
  color: '#A3ADF0',
  borderRadius: 8,
  padding: '10px 22px',
  fontFamily: '"Sora", sans-serif',
  fontWeight: 500,
  fontSize: 14,
  textTransform: 'none',
  border: '1px solid rgba(108,120,214,0.5)',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(108,120,214,0.1)',
    borderColor: '#6C78D6',
    color: '#e8ebff',
  },
});

const LoadingOrb = styled(Box)({
  position: 'relative',
  width: 100,
  height: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108,120,214,0.25) 0%, transparent 70%)',
    animation: `${pulseRing} 2s ease-in-out infinite`,
  },
});

const SpinRing = styled(Box)<{ size?: number; color?: string; speed?: string }>(({ size = 60, color = '#6C78D6', speed = '1.2s' }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  border: `2px solid transparent`,
  borderTop: `2px solid ${color}`,
  animation: `${rotateSlow} ${speed} linear infinite`,
}));

const InsightCard = styled(Box)({
  background: 'rgba(108, 120, 214, 0.1)',
  border: '1px solid rgba(108, 120, 214, 0.3)',
  borderRadius: 16,
  padding: '20px',
  marginBottom: '24px',
  animation: `${fadeUp} 0.6s ease both`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0, left: 0, width: '4px', height: '100%',
    background: 'linear-gradient(to bottom, #6C78D6, #7B529E)',
  }
});

// ─── CUSTOM STEPPER ────────────────────────────────────────────────────────────
const CustomStepper: React.FC<{ steps: string[]; activeStep: number }> = ({ steps, activeStep }) => (
  <Box display="flex" alignItems="center" mb={4}>
    {steps.map((label, index) => (
      <React.Fragment key={label}>
        <StyledStep>
          <StepCircle active={activeStep === index ? 1 : 0} completed={activeStep > index ? 1 : 0}>
            {activeStep > index ? '✓' : index + 1}
          </StepCircle>
          <Typography variant="caption" sx={{
            fontFamily: '"Sora", sans-serif',
            fontSize: 11,
            fontWeight: activeStep === index ? 600 : 400,
            color: activeStep === index ? '#A3ADF0' : activeStep > index ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
            textAlign: 'center',
            letterSpacing: '0.02em',
            transition: 'color 0.3s ease',
          }}>
            {label}
          </Typography>
        </StyledStep>
        {index < steps.length - 1 && (
          <Box sx={{
            flex: 1,
            height: 1,
            background: activeStep > index
              ? 'linear-gradient(90deg, rgba(108,120,214,0.8), rgba(108,120,214,0.3))'
              : 'rgba(255,255,255,0.15)',
            mx: 1,
            mb: 3.5,
            transition: 'background 0.5s ease',
          }} />
        )}
      </React.Fragment>
    ))}
  </Box>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
const WizardPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { step, clientName, projectDescription, loading, proposalId, status } = useSelector((state: RootState) => state.proposal);
  const { t } = useTranslation();

  const [aiResult, setAiResult] = useState<string>('');

  const [hourlyRate, setHourlyRate] = useState<string>(''); 
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]); 
  const [selectedSections, setSelectedSections] = useState<string[]>([]); 

  const availableFeatures = [
    "SEO Optimizasyonu", "Mobil Uyumlu Tasarım", "Yönetim Paneli", "Ödeme Sistemi", 
    "Çoklu Dil Desteği", "Sosyal Medya Giriş", "Karanlık Mod", "Yüksek Güvenlik (SSL)"
  ];

  const reportSections = [
    { id: 'ozet', label: '1. Yönetici Özeti' },
    { id: 'cozum', label: '2. Çözüm Önerisi & Teknik' },
    { id: 'kapsam', label: '3. Kapsam ve İş Kalemleri' },
    { id: 'rakip', label: '4. Rakip Analizi' },
    { id: 'takvim', label: '5. Proje Takvimi' }
  ];

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const feature = e.target.name;
    if (e.target.checked) {
        setSelectedFeatures([...selectedFeatures, feature]);
    } else {
        setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    }
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sectionId = e.target.name;
    if (e.target.checked) {
        setSelectedSections([...selectedSections, sectionId]);
    } else {
        setSelectedSections(selectedSections.filter(s => s !== sectionId));
    }
  };

  const steps = [
    t('wizard.step1', 'Proje Bilgileri'),
    t('wizard.step2', 'AI Analizi'),
    t('wizard.step3', 'Sonuç ve Teklif')
  ];

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Teklif-${clientName || 'Taslak'}`,
  });

 const handleAIAnalysis = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        navigate('/login'); 
        return;
    }

    dispatch(setLoading(true));
    dispatch(setProposalStatus('pending')); // Bekleme modunu aktifleştir
    
    try {
        const payload = {
            jobTitle: `${clientName} Projesi`, 
            companyName: clientName,
            jobDescription: projectDescription,
            tone: 'Professional',
            selectedFeatures, 
            hourlyRate,
            selectedSections 
        };

        const response = await axios.post('http://localhost:5001/api/proposals', payload, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // YENİ MİMARİ: Backend'i beklemiyoruz, sadece gelen kuyruk ID'sini kaydediyoruz
        if (response.data && response.data.proposalId) {
            dispatch(setProposalId(response.data.proposalId)); 
            // NOT: Burada nextStep() YAPMIYORUZ. Sonuç gelince polling yapacak.
        }

    } catch (error: any) {
        console.error("AI Hatası:", error);
        dispatch(setLoading(false));
        dispatch(setProposalStatus('error'));
        
        if (error.response && error.response.status === 401) {
            alert("Yetkilendirme hatası! Lütfen tekrar giriş yapın.");
            localStorage.removeItem('token');
            navigate('/login');
        } else {
            alert("Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.");
        }
    }
  };

  // YENİ EKLENEN POLLING MANTIĞI
  // YENİ EKLENEN POLLING MANTIĞI (GÜNCELLENDİ)
  const [insights, setInsights] = useState<string[]>([])
  useEffect(() => {
    
    let intervalId: ReturnType<typeof setInterval>;

    const checkProposalStatus = async () => {
      // Eğer ID yoksa veya işlem zaten bitmişse kontrol etme
      if (!proposalId || status === 'completed') return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5001/api/proposals/${proposalId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = response.data;
        
        // Backend "completed" dediyse VEYA gelen metin taslak metinden farklıysa (AI doldurduysa)
        const isCompleted = data.status === 'completed' || 
                           (data.generatedCoverLetter && data.generatedCoverLetter !== 'Yapay zeka teklifinizi hazırlıyor, lütfen bekleyin...');

        if (isCompleted) {
          clearInterval(intervalId); // Sormayı bırak
          dispatch(setProposalStatus('completed'));
          setAiResult(data.generatedCoverLetter); // Gemini metnini ekrana bas
          setInsights(data.aiInsights || []);
          dispatch(setLoading(false)); // Yükleme animasyonunu durdur
          dispatch(nextStep()); // Otomatik olarak Step 2'ye (Sonuç Sayfasına) geç
          dispatch(setProposalId(null)); // ID'yi temizle
        }
      } catch (error) {
        console.error("Durum sorgulama hatası:", error);
      }
    };

    // Eğer bir ID'miz varsa ve durum 'pending' ise 3 saniyede bir kontrol et
    if (proposalId && status === 'pending') {
      intervalId = setInterval(checkProposalStatus, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId); // Component kapanırsa intervali temizle
    };
  }, [proposalId, status, dispatch]);

  const handleNext = () => {
    if (step === 0) {
      if (!clientName || !projectDescription) {
          alert("Lütfen proje bilgilerini eksiksiz doldurun.");
          return;
      }
      dispatch(nextStep());
      handleAIAnalysis(); 
    } else {
      dispatch(nextStep());
    }
  };

  const handleSaveAndFinish = () => {
    dispatch(saveProposalToHistory());
    navigate('/dashboard');
  };

  return (
    <ThemeProvider theme={theme}>
      {/* Google Font Import */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');`}</style>

      <PageWrapper>
        <GlassCard elevation={0}>
          {/* Header */}
          <Box textAlign="center" mb={5}>
            <Box display="inline-flex" alignItems="center" gap={1.5} mb={1.5}
              sx={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 99,
                px: 2.5, py: 0.75,
              }}
            >
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 0 8px #FFFFFF' }} />
              <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600, fontFamily: '"Sora", sans-serif', letterSpacing: '0.08em', fontSize: 11, textTransform: 'uppercase' }}>
                AI Destekli
              </Typography>
            </Box>
            <GradientTitle variant="h4">
              DotProposal {t('wizard.titleSuffix', 'Sihirbazı')}
            </GradientTitle>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5, fontFamily: '"Sora", sans-serif', fontSize: 13 }}>
              Saniyeler içinde profesyonel proje teklifleri oluşturun
            </Typography>
          </Box>

          {/* Custom Stepper */}
          <CustomStepper steps={steps} activeStep={step} />

          {/* Step Content */}
          <Box sx={{ minHeight: 280 }}>

            {/* ─── STEP 0: Project Info ──────────────────────────── */}
            {step === 0 && (
              <Box display="flex" flexDirection="column" gap={2.5} sx={{ animation: `${fadeUp} 0.4s ease both` }}>
                <TextField
                  label={t('wizard.clientName', 'Müşteri Adı')}
                  variant="outlined"
                  fullWidth
                  value={clientName}
                  onChange={(e) => dispatch(setProposalData({ field: 'clientName', value: e.target.value }))}
                />
                <TextField
                  label={t('wizard.projectDesc', 'Proje Açıklaması')}
                  variant="outlined"
                  multiline
                  rows={4}
                  fullWidth
                  placeholder={t('wizard.descPlaceholder', 'Örn: Bir E-ticaret sitesi istiyorum...')}
                  value={projectDescription}
                  onChange={(e) => dispatch(setProposalData({ field: 'projectDescription', value: e.target.value }))}
                />

                {/* Features Section */}
                <Box sx={{
                  p: 2.5,
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.05)',
                }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600, color: '#FFFFFF', mb: 0.5, fontSize: 13 }}>
                    Proje Özellikleri
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mb: 2, fontSize: 11 }}>
                    Opsiyoneldir. Seçim yapmazsanız AI genel analiz yapar.
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {availableFeatures.map((feature) => (
                      <FeatureChip
                        key={feature}
                        checked={selectedFeatures.includes(feature)}
                        control={<Checkbox name={feature} checked={selectedFeatures.includes(feature)} onChange={handleFeatureChange} size="small" sx={{ p: 0.5 }} />}
                        label={<Typography variant="caption" sx={{ fontFamily: '"Sora", sans-serif', fontSize: 12, color: selectedFeatures.includes(feature) ? '#FFFFFF' : 'rgba(255,255,255,0.7)' }}>{feature}</Typography>}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Advanced Options Accordion */}
                <Accordion sx={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px !important',
                  boxShadow: 'none',
                  '&::before': { display: 'none' },
                  '&.Mui-expanded': { margin: 0, border: '1px solid rgba(255,255,255,0.3)' },
                }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />} sx={{ borderRadius: 3 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <SettingsSuggestIcon sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontFamily: '"Sora", sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                        Gelişmiş Seçenekler — Fiyat & Rapor İçeriği
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Box display="flex" flexDirection="column" gap={2.5}>
                      <TextField 
                        label="Saatlik Ücret (Opsiyonel)" 
                        type="number" 
                        size="small"
                        fullWidth 
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon sx={{ color: '#666', fontSize: 18 }} /></InputAdornment> }}
                        helperText={<span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Doldurursanız raporun sonuna 'Tahmini Bütçe' tablosu eklenir.</span>}
                      />

                      <Divider />
                      
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mb: 1.5, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Rapor Bölümleri — Seçim yapılmazsa hepsi oluşturulur
                        </Typography>
                        <FormGroup>
                          {reportSections.map(s => (
                            <FormControlLabel 
                              key={s.id} 
                              control={<Checkbox name={s.id} checked={selectedSections.includes(s.id)} onChange={handleSectionChange} size="small" color="secondary" />} 
                              label={<Typography variant="caption" sx={{ fontFamily: '"Sora", sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{s.label}</Typography>} 
                              sx={{ py: 0.25 }}
                            />
                          ))}
                        </FormGroup>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}

            {/* ─── STEP 1: AI Loading ────────────────────────────── */}
            {step === 1 && (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6} gap={4} sx={{ animation: `${fadeUp} 0.4s ease both` }}>
                {loading ? (
                  <>
                    <LoadingOrb>
                      <SpinRing size={80} color="rgba(255,255,255,0.8)" speed="1.4s" />
                      <SpinRing size={60} color="rgba(123,82,158,0.7)" speed="0.9s" />
                      <SpinRing size={40} color="rgba(108,120,214,0.6)" speed="1.8s" />
                      <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg, #6C78D6, #7B529E)', boxShadow: '0 0 20px rgba(255,255,255,0.8)' }} />
                    </LoadingOrb>

                    <Box textAlign="center">
                      <Typography variant="h6" sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 700, color: '#FFFFFF', mb: 1 }}>
                        {t('wizard.aiAnalyzing', 'Yapay Zeka Projenizi Analiz Ediyor...')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: '"Sora", sans-serif', fontSize: 13 }}>
                        {hourlyRate ? "Bütçe hesaplanıyor ve iş kalemleri belirleniyor..." : "İş kalemleri çıkarılıyor, teklif hazırlanıyor..."}
                      </Typography>
                    </Box>

                    {/* Loading steps indicator */}
                    <Box display="flex" gap={1} alignItems="center">
                      {['Analiz', 'Planlama', 'Yazım'].map((label, i) => (
                        <Box key={label} display="flex" alignItems="center" gap={1}>
                          <Box sx={{
                            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                          }}>
                            <CircularProgress size={14} sx={{ color: '#FFFFFF' }} />
                          </Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: '"Sora", sans-serif', fontSize: 11 }}>{label}</Typography>
                          {i < 2 && <Box sx={{ width: 20, height: 1, background: 'rgba(255,255,255,0.2)' }} />}
                        </Box>
                      ))}
                    </Box>
                  </>
                ) : (
                  <Box textAlign="center" sx={{ animation: `${fadeUp} 0.4s ease both` }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))', border: '2px solid rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, fontSize: 28, color: '#fff' }}>
                      ✓
                    </Box>
                    <Typography variant="h6" sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 700, color: '#FFFFFF' }}>
                      {t('wizard.analysisComplete', 'Analiz Tamamlandı!')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5, fontFamily: '"Sora", sans-serif' }}>
                      Sonuçları görmek için ilerleyin.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* ─── STEP 2: Result ───────────────────────────────── */}
            {step === 2 && (
                
              <Box sx={{ animation: `${fadeUp} 0.4s ease both` }}>
                {/* 🤖 AI STRATEJİK TAVSİYELER PANELİ */}
    {insights && insights.length > 0 && (
      <InsightCard>
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <SettingsSuggestIcon sx={{ color: '#A3ADF0' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#A3ADF0', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: 12 }}>
            Sana Özel Stratejik Tavsiyeler (Gizli)
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" gap={1.5}>
          {insights.map((insight, idx) => (
            <Box key={idx} display="flex" gap={1.5} alignItems="flex-start">
              <Box sx={{ mt: 0.8, width: 6, height: 6, borderRadius: '50%', background: '#6C78D6', flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 1.5, fontFamily: '"Sora", sans-serif' }}>
                {insight}
              </Typography>
            </Box>
          ))}
        </Box>
      </InsightCard>
    )}

    {/* Mevcut Header (Teklifiniz Hazır kısmı) burdan devam edecek... */}
                
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
                  <Box>
                    <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 0 10px rgba(255,255,255,0.8)' }} />
                      <Typography variant="h6" sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 700, color: '#FFFFFF' }}>
                        {t('wizard.proposalReady', 'Teklifiniz Hazır!')}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', pl: 2.5, fontFamily: '"Sora", sans-serif', fontSize: 12 }}>
                      {t('wizard.previewDesc', 'Aşağıda önizlemesini görebilirsiniz.')}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" gap={1.5}>
                    <OutlineButton startIcon={<PrintIcon />} onClick={() => handlePrint && handlePrint()}>
                      {t('wizard.downloadPDF', 'PDF İndir')}
                    </OutlineButton>
                    <PrimaryButton startIcon={<SaveIcon />} onClick={handleSaveAndFinish}>
                      {t('wizard.saveFinish', 'Kaydet & Bitir')}
                    </PrimaryButton>
                  </Box>
                </Box>
                
                {/* PDF Preview */}
                <Box sx={{ 
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 3,
                  height: 580,
                  overflow: 'auto',
                  mb: 2,
                  position: 'relative',
                  '&::-webkit-scrollbar': { width: 6 },
                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.3)', borderRadius: 3 },
                }}>
                  {/* Top bar like a browser/viewer */}
                  <Box sx={{ position: 'sticky', top: 0, zIndex: 1, background: 'rgba(100,110,210,0.4)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.1)', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#FF6F91', opacity: 0.9 }} />
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#FFD06F', opacity: 0.9 }} />
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#6FFF91', opacity: 0.9 }} />
                    <Typography variant="caption" sx={{ ml: 2, color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: '"Sora", sans-serif' }}>
                      {clientName ? `${clientName} — Proje Teklifi.pdf` : 'proje-teklifi.pdf'}
                    </Typography>
                  </Box>

                  <Box p={3} display="flex" justifyContent="center">
                    <Box 
                      ref={componentRef} 
                      sx={{ 
                        bgcolor: 'white',
                        width: '100%', 
                        maxWidth: '210mm', 
                        minHeight: '297mm',
                        p: 5,
                        boxShadow: '0 20px 80px rgba(0,0,0,0.3)',
                        color: '#111',
                        borderRadius: 2,
                        transform: 'scale(0.9)',
                        transformOrigin: 'top center',
                      }}
                    >
                      <Box sx={{ borderBottom: '3px solid #6C78D6', pb: 2, mb: 3 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#6C78D6' }}>
                          {clientName ? `${clientName} Proje Teklifi` : 'Proje Teklifi'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="subtitle1" color="textSecondary">
                            <strong>Tarih:</strong> {new Date().toLocaleDateString('tr-TR')}
                          </Typography>
                          <Typography variant="subtitle1" color="textSecondary">
                            <strong>Hazırlayan:</strong> Freelancer
                          </Typography>
                        </Box>
                      </Box>

                      <div className="markdown-content">
                        {aiResult ? (
                          <ReactMarkdown
                            components={{
                              h1: ({node, ...props}: any) => <Typography variant="h5" sx={{ mt: 3, mb: 1, color: '#2c3e50', fontWeight: 'bold', borderBottom:'1px solid #eee' }} {...props} />,
                              h2: ({node, ...props}: any) => <Typography variant="h6" sx={{ mt: 2, mb: 1, color: '#34495e', fontWeight: 'bold' }} {...props} />,
                              p: ({node, ...props}: any) => <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.6 }} {...props} />,
                              li: ({node, ...props}: any) => <li style={{ marginBottom: '5px', marginLeft: '20px' }} {...props} />,
                              strong: ({node, ...props}: any) => <span style={{ fontWeight: 'bold', color: '#6C78D6' }} {...props} />
                            }}
                          >
                            {aiResult}
                          </ReactMarkdown>
                        ) : (
                          <Typography color="error">Veri yüklenemedi.</Typography>
                        )}
                      </div>
                      
                      <Divider sx={{ mt: 5, mb: 2 }} />
                      <Typography variant="caption" align="center" display="block" color="textSecondary">
                        Bu teklif DotProposal Yapay Zeka altyapısı ile oluşturulmuştur.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* ─── Navigation ───────────────────────────────────────── */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {step !== 2 ? (
              <SecondaryButton
                disabled={step === 0 || loading}
                onClick={() => dispatch(prevStep())}
              >
                ← {t('wizard.back', 'Geri')}
              </SecondaryButton>
            ) : <Box />}
            
            {step < 2 && (
              <PrimaryButton
                onClick={handleNext}
                disabled={loading || (step === 0 && (!clientName || !projectDescription))}
              >
                {step === 0 ? `✦ ${t('wizard.analyze', 'Analiz Et')}` : `${t('wizard.next', 'İleri')} →`}
              </PrimaryButton>
            )}
          </Box>
        </GlassCard>
      </PageWrapper>
    </ThemeProvider>
  );
};

export default WizardPage;