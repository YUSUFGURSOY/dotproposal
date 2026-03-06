/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
// 👇 HATA 2 ÇÖZÜLDÜ: Kullanılmayan 'IconButton' importtan çıkarıldı
import { Container, Paper, Typography, Box, CircularProgress, Divider, Chip, TextField, Button, Tooltip } from '@mui/material'; 
import { styled } from '@mui/material/styles';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; 
import html2pdf from 'html2pdf.js'; 

const PageWrapper = styled(Box)({
  minHeight: '100vh',
  background: '#f4f6f8', 
  paddingTop: '60px',
  paddingBottom: '80px',
});

const PublicProposalPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) return;
    setIsSubmitting(true);
    try {
      await axios.post(`http://localhost:5001/api/proposals/public/${id}/feedback`, { feedback });
      setIsSubmitted(true);
    } catch (err) {
      alert('Mesaj gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchPublicProposal = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/proposals/public/${id}`);
        setProposal(response.data);
      } catch (err) {
        setError('Bu teklif bulunamadı veya süresi dolmuş olabilir.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPublicProposal();
  }, [id]);

  const handleDownloadPDF = () => {
    const element = document.getElementById('proposal-document');
    if (!element) return;

    // 👇 HATA 1 ÇÖZÜLDÜ: TypeScript'in kızmaması için değerlerin yanına 'as const' (Bu kesin bir ayardır) eklendi
    const opt = {
      margin:       15,
      filename:     `${proposal.jobTitle || 'Teklif'}_Detay.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (error || !proposal) return <Typography align="center" mt={10} variant="h5" color="textSecondary">{error}</Typography>;

  return (
    <PageWrapper>
      <Container maxWidth="md">
        
        <Paper id="proposal-document" elevation={4} sx={{ p: { xs: 3, md: 6 }, backgroundColor: '#ffffff', borderRadius: 3 }}>
          
          <Box sx={{ borderBottom: '2px solid #eee', pb: 2, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#2c3e50', fontWeight: 'bold' }}>
                {proposal.jobTitle}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip label={proposal.companyName} size="small" sx={{ background: '#e3f2fd', color: '#2e7d32', fontWeight: 'bold' }} />
                <Typography variant="body2" color="textSecondary">
                  Tarih: {new Date(proposal.createdAt).toLocaleDateString('tr-TR')}
                </Typography>
              </Box>
            </Box>

            <Tooltip title="Teklifi PDF Olarak İndir" arrow>
              <Button 
                variant="outlined" 
                startIcon={<PictureAsPdfIcon />} 
                onClick={handleDownloadPDF}
                data-html2canvas-ignore
                sx={{ 
                  color: '#d32f2f', borderColor: '#d32f2f', fontWeight: 'bold', borderRadius: 2,
                  '&:hover': { background: 'rgba(211, 47, 47, 0.08)' } 
                }}
              >
                İNDİR
              </Button>
            </Tooltip>
          </Box>

          <Box className="markdown-content">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2, color: '#1976d2', fontWeight: 'bold' }} {...props} />,
                h2: ({node, ...props}) => <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2, color: '#34495e', fontWeight: 'bold', borderBottom:'1px solid #eee', pb: 1 }} {...props} />,
                p: ({node, ...props}) => <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: '#424242' }} {...props} />,
                li: ({node, ...props}) => <li style={{ marginBottom: '10px', color: '#424242', lineHeight: 1.6 }} {...props} />,
                strong: ({node, ...props}) => <strong style={{ color: '#1976d2' }} {...props} />
              }}
            >
              {proposal.generatedCoverLetter.replace(/\\n/g, '\n')}
            </ReactMarkdown>
          </Box>

          <Box data-html2canvas-ignore>
            <Divider sx={{ my: 5 }} />
            
            {isSubmitted ? (
              <Box textAlign="center" p={4} bgcolor="#e8f5e9" borderRadius={3} border="1px solid #c8e6c9">
                <Typography variant="h6" color="success.main" fontWeight="bold" gutterBottom>
                  Mesajınız Başarıyla İletildi! 🎉
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Proje sahibi en kısa sürede size dönüş yapacaktır. Teklifi incelediğiniz için teşekkür ederiz.
                </Typography>
              </Box>
            ) : (
              <Box mt={4} bgcolor="#f8fafc" p={4} borderRadius={3} border="1px solid #e2e8f0">
                <Typography variant="h6" gutterBottom color="#1e293b" fontWeight="bold">
                  Proje Hakkında Sorunuz mu Var?
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={3}>
                  Bu teklifle ilgili düşüncelerinizi, revizyon taleplerinizi veya sorularınızı doğrudan yazılımcıya iletebilirsiniz.
                </Typography>
                
                <TextField
                  fullWidth multiline rows={4} variant="outlined"
                  placeholder="Örn: Fiyat konusunda biraz daha esneklik sağlayabilir miyiz? veya Mobil uygulama kısmını detaylandırabilir misiniz?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  sx={{ mb: 2, backgroundColor: 'white' }}
                />
                
                <Box display="flex" justifyContent="flex-end">
                  <Button 
                    variant="contained" size="large" onClick={handleFeedbackSubmit}
                    disabled={isSubmitting || !feedback.trim()}
                    sx={{ fontWeight: 'bold', px: 5, py: 1.5, background: 'linear-gradient(45deg, #1976d2, #1565c0)' }}
                  >
                    {isSubmitting ? 'GÖNDERİLİYOR...' : 'MESAJI GÖNDER'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

        </Paper>
      </Container>
    </PageWrapper>
  );
};

export default PublicProposalPage;