/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { 
  Container, Paper, Typography, Button, Box, CircularProgress, Divider, Chip 
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// YENİ EKLENEN İKON VE STYLED IMPORTLARI
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { styled, keyframes } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// Backend'den gelen verinin tipi (aiInsights eklendi)
interface Proposal {
  _id: string;
  jobTitle: string;
  companyName: string;
  generatedCoverLetter: string; 
  createdAt: string;
  aiInsights?: string[]; // 👈 EKLENDİ
}

// ─── STYLED COMPONENTS (Sitenin geneliyle uyumlu tasarım) ─────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// Sayfanın ana arka planı (Mavi/Mor Gradyan)
const PageWrapper = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #6773d4 0%, #7e529d 100%)',
  paddingTop: '40px',
  paddingBottom: '80px',
});

// Cam Efektli Tavsiye Paneli
const InsightCard = styled(Box)({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 16,
  padding: '24px',
  marginBottom: '24px',
  position: 'relative',
  overflow: 'hidden',
  animation: `${fadeUp} 0.5s ease both`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0, left: 0, width: '4px', height: '100%',
    background: 'linear-gradient(to bottom, #A3ADF0, #fff)',
  }
});

const ProposalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // PDF'e çevrilecek alanı seçmek için referans
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const token = localStorage.getItem('token'); // Token'ı al
        const response = await axios.get(`http://localhost:5001/api/proposals/${id}`, {
          headers: { Authorization: `Bearer ${token}` } // Yetkilendirme
        });
        setProposal(response.data);
      } catch (error) {
        console.error("Teklif yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProposal();
  }, [id]);

  // PDF Oluşturma Fonksiyonu
  const handleDownloadPDF = () => {
    const element = contentRef.current;
    if (!element) return;

    const opt = {
      margin:       10,
      filename:     `Teklif-${proposal?.companyName || 'DotProposal'}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    (html2pdf() as any).set(opt).from(element).save();
  };
  // MÜŞTERİ LİNKİNİ KOPYALAMA FONKSİYONU
  const handleCopyLink = () => {
    // Projenin çalıştığı ana adresi alır (Örn: http://localhost:5173) ve sonuna /view/id ekler
    const link = `${window.location.origin}/view/${proposal?._id}`;
    navigator.clipboard.writeText(link);
    alert('Müşteri linki kopyalandı! 🚀\n\nArtık bu linki müşterinize WhatsApp veya Mail üzerinden güvenle gönderebilirsiniz.');
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (!proposal) return <Typography align="center" mt={5}>Teklif bulunamadı.</Typography>;

  return (
    // 👈 ARKA PLAN PAGEWRAPPER İLE SARMALANDI
    <PageWrapper>
      <Container maxWidth="md" sx={{ py: 4 }}>
        
        {/* Üst Butonlar (Renkleri arka plana uyumlu hale getirildi) */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} variant="outlined" href="/dashboard" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white' } }}>
            Geri Dön
          </Button>
          {/*KOPYALAMA BUTONU*/}
            <Button 
              variant="outlined" 
              startIcon={<ContentCopyIcon />} 
              onClick={handleCopyLink}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.1)' } }}
            >
              LİNKİ KOPYALA
            </Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />} 
            onClick={handleDownloadPDF}
            sx={{ background: 'white', color: '#6773d4', fontWeight: 'bold', '&:hover': { background: '#f0f0f0' } }}
          >
            PDF OLARAK İNDİR
          </Button>
        </Box>

        {/* 🤖 AI STRATEJİK TAVSİYELER PANELİ (Müşteriye gitmeyecek kısım) */}
        {proposal.aiInsights && proposal.aiInsights.length > 0 && (
          <InsightCard>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <SettingsSuggestIcon sx={{ color: '#fff' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: 13 }}>
                Bu Proje İçin Gizli Datproposal İçgörüleri
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {proposal.aiInsights.map((insight, idx) => (
                <Box key={idx} display="flex" gap={1.5} alignItems="flex-start">
                  <Box sx={{ mt: 0.8, width: 6, height: 6, borderRadius: '50%', background: '#A3ADF0', flexShrink: 0, boxShadow: '0 0 8px rgba(163, 173, 240, 0.8)' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontSize: 14, lineHeight: 1.6, fontFamily: '"Sora", sans-serif' }}>
                    {insight}
                  </Typography>
                </Box>
              ))}
            </Box>
          </InsightCard>
        )}

        {/* PDF'e Dönüşecek Alan (Burası Bembeyaz ve Aynı Kaldı) */}
        <div ref={contentRef}>
          <Paper elevation={6} sx={{ p: 5, backgroundColor: '#ffffff', borderRadius: 2 }}>
            
            {/* Başlık Kısmı */}
            <Box sx={{ borderBottom: '2px solid #eee', pb: 2, mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom color="primary">
                {proposal.jobTitle}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip label={proposal.companyName} color="secondary" variant="outlined" />
                <Typography variant="body2" color="textSecondary">
                  Oluşturulma Tarihi: {new Date(proposal.createdAt).toLocaleDateString('tr-TR')}
                </Typography>
              </Box>
            </Box>

            {/* Yapay Zeka İçeriği (Markdown Render) */}
            <Box className="markdown-content">
              <ReactMarkdown
                  components={{
                      h1: ({node, ...props}) => <Typography variant="h5" gutterBottom sx={{ mt: 3, color: '#1976d2', fontWeight: 'bold' }} {...props} />,
                      h2: ({node, ...props}) => <Typography variant="h6" gutterBottom sx={{ mt: 2, borderBottom:'1px solid #ddd' }} {...props} />,
                      p: ({node, ...props}) => <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }} {...props} />,
                      li: ({node, ...props}) => <li style={{ marginBottom: '8px' }} {...props} />,
                  }}
              >
                {proposal.generatedCoverLetter}
              </ReactMarkdown>
            </Box>

            {/* Alt Bilgi */}
            <Divider sx={{ my: 4 }} />
            <Typography variant="caption" display="block" align="center" color="textSecondary">
              Bu teklif DotProposal Yapay Zeka sistemi tarafından otomatik oluşturulmuştur.
            </Typography>
          </Paper>
        </div>
      </Container>
    </PageWrapper>
  );
};

export default ProposalDetail;