/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useRef, useState } from 'react';
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
  saveProposalToHistory
} from '../features/proposal/proposalSlice';
import { 
    Container, Paper, Stepper, Step, StepLabel, Button, Typography, TextField, Box, 
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

const WizardPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { step, clientName, projectDescription, loading } = useSelector((state: RootState) => state.proposal);
  const { t } = useTranslation();

  const [aiResult, setAiResult] = useState<string>('');

  // --- OPSİYONEL STATE'LER ---
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

  // ✅ DÜZELTME 1: if-else yapısı kullanıldı (ESLint hatası giderildi)
  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const feature = e.target.name;
    if (e.target.checked) {
        setSelectedFeatures([...selectedFeatures, feature]);
    } else {
        setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    }
  };

  // ✅ DÜZELTME 2: if-else yapısı kullanıldı (ESLint hatası giderildi)
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

        if (response.data && response.data.generatedCoverLetter) {
            setAiResult(response.data.generatedCoverLetter);
            dispatch(nextStep());
        }

    } catch (error: any) {
        console.error("AI Hatası:", error);
        if (error.response && error.response.status === 401) {
            alert("Yetkilendirme hatası! Lütfen tekrar giriş yapın.");
            localStorage.removeItem('token');
            navigate('/login');
        } else {
            alert("Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.");
        }
    } finally {
        dispatch(setLoading(false));
    }
  };

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
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          DotProposal {t('wizard.titleSuffix', 'Sihirbazı')}
        </Typography>

        <Stepper activeStep={step} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4, minHeight: '200px' }}>
          {step === 0 && (
            <Box display="flex" flexDirection="column" gap={3}>
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

              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Proje Özellikleri (Seçmeli):
                </Typography>
                <Typography variant="caption" color="textSecondary" mb={1} display="block">
                    Opsiyoneldir. Hiçbir şey seçmezseniz AI genel analiz yapar.
                </Typography>
                <FormGroup row>
                    {availableFeatures.map((feature) => (
                        <FormControlLabel
                            key={feature}
                            control={<Checkbox name={feature} checked={selectedFeatures.includes(feature)} onChange={handleFeatureChange} size="small" />}
                            label={<Typography variant="caption">{feature}</Typography>}
                            sx={{ width: '45%' }}
                        />
                    ))}
                </FormGroup>
              </Box>

              <Accordion sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <SettingsSuggestIcon color="action" />
                        <Typography variant="subtitle2">Gelişmiş Seçenekler (Fiyat & Rapor İçeriği)</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Box display="flex" flexDirection="column" gap={3}>
                        <TextField 
                            label="Saatlik Ücret (Opsiyonel)" 
                            type="number" 
                            size="small"
                            fullWidth 
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon /></InputAdornment> }}
                            helperText="Eğer doldurursanız raporun sonuna 'Tahmini Bütçe' tablosu eklenir."
                        />

                        <Divider />
                        
                        <Box>
                            <Typography variant="caption" color="textSecondary" display="block" mb={1} fontWeight="bold">
                                Rapor Bölümleri (Hiçbiri seçilmezse HEPSİ oluşturulur):
                            </Typography>
                            <FormGroup row>
                                {reportSections.map(s => (
                                    <FormControlLabel 
                                        key={s.id} 
                                        control={<Checkbox name={s.id} checked={selectedSections.includes(s.id)} onChange={handleSectionChange} size="small" color="secondary"/>} 
                                        label={<Typography variant="caption">{s.label}</Typography>} 
                                        sx={{ width: '100%' }}
                                    />
                                ))}
                            </FormGroup>
                        </Box>
                    </Box>
                </AccordionDetails>
              </Accordion>

            </Box>
          )}

          {step === 1 && (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={5}>
              {loading ? (
                <>
                  <CircularProgress size={60} />
                  <Typography variant="h6" sx={{ mt: 3 }}>{t('wizard.aiAnalyzing', 'Yapay Zeka Projenizi Analiz Ediyor...')}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hourlyRate ? "Bütçe hesaplanıyor..." : "İş kalemleri çıkarılıyor..."}
                  </Typography>
                </>
              ) : (
                <Typography variant="h6" color="success.main">
                  {t('wizard.analysisComplete', 'Analiz Tamamlandı! Sonuçları görmek için ilerleyin.')}
                </Typography>
              )}
            </Box>
          )}

          {step === 2 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
                <Box>
                   <Typography variant="h6" color="primary">{t('wizard.proposalReady', 'Teklifiniz Hazır!')}</Typography>
                   <Typography variant="caption">{t('wizard.previewDesc', 'Aşağıda önizlemesini görebilirsiniz.')}</Typography>
                </Box>
                
                <Box display="flex" gap={2}>
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      startIcon={<PrintIcon />}
                      onClick={() => handlePrint && handlePrint()}
                    >
                      {t('wizard.downloadPDF', 'PDF İndir')}
                    </Button>
                    
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<SaveIcon />}
                      onClick={handleSaveAndFinish}
                    >
                      {t('wizard.saveFinish', 'Kaydet ve Bitir')}
                    </Button>
                </Box>
              </Box>
              
              <Box sx={{ 
                border: '1px solid #ddd', 
                bgcolor: '#525659', 
                height: '600px', 
                overflow: 'auto', 
                mb: 2,
                borderRadius: 2,
                p: 2,
                display: 'flex',
                justifyContent: 'center'
              }}>
                <Box 
                    ref={componentRef} 
                    sx={{ 
                        transform: 'scale(0.9)', 
                        transformOrigin: 'top center',
                        bgcolor: 'white', 
                        width: '100%', 
                        maxWidth: '210mm', 
                        minHeight: '297mm',
                        p: 5,
                        boxShadow: 3,
                        color: 'black'
                    }}
                >
                    <Box sx={{ borderBottom: '2px solid #1976d2', pb: 2, mb: 3 }}>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
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
                                    strong: ({node, ...props}: any) => <span style={{ fontWeight: 'bold', color: '#1976d2' }} {...props} />
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
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          {step !== 2 && (
            <Button
                disabled={step === 0 || loading}
                onClick={() => dispatch(prevStep())}
            >
                {t('wizard.back', 'Geri')}
            </Button>
          )}
          
          {step < 2 && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading || (step === 0 && (!clientName || !projectDescription))}
              sx={{ ml: 'auto' }}
            >
              {step === 0 ? t('wizard.analyze', 'Analiz Et') : t('wizard.next', 'İleri')}
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default WizardPage;