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

// Backend'den gelen verinin tipi
interface Proposal {
  _id: string;
  jobTitle: string;
  companyName: string;
  generatedCoverLetter: string; // Yapay Zeka Çıktısı
  createdAt: string;
}

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
      // HATA 1 ÇÖZÜMÜ: image tipi için 'as const'
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      // HATA 2 ÇÖZÜMÜ: orientation tipi için 'as const'
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    // Typescript kontrolünü burada esnetiyoruz
    (html2pdf() as any).set(opt).from(element).save();
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (!proposal) return <Typography align="center" mt={5}>Teklif bulunamadı.</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Üst Butonlar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} variant="outlined" href="/dashboard">
          Geri Dön
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<DownloadIcon />} 
          onClick={handleDownloadPDF}
        >
          PDF OLARAK İNDİR
        </Button>
      </Box>

      {/* PDF'e Dönüşecek Alan (Referans buraya verildi) */}
      <div ref={contentRef}>
        <Paper elevation={3} sx={{ p: 5, backgroundColor: '#fdfdfd' }}>
          
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
                    // Dosyanın tepesindeki 'eslint-disable' sayesinde buradaki hatalar gitti
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
  );
};

export default ProposalDetail;