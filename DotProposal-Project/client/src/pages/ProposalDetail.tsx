/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { 
  Container, Paper, Typography, Button, Box, CircularProgress, Divider, Chip, TextField,
  Menu, MenuItem, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions // 👇 YENİ: Pop-up için eklendi
} from '@mui/material'; 
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { styled, keyframes } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ForumIcon from '@mui/icons-material/Forum';
import EditIcon from '@mui/icons-material/Edit'; 
import SaveIcon from '@mui/icons-material/Save'; 

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import ShortTextIcon from '@mui/icons-material/ShortText';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'; // 👇 YENİ: Özel Talimat İkonu

interface Proposal {
  _id: string;
  jobTitle: string;
  companyName: string;
  generatedCoverLetter: string; 
  createdAt: string;
  aiInsights?: string[];
  clientFeedback?: string;
  clientFeedbackDate?: string; 
  isClientFeedbackRead?: boolean;
}

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const PageWrapper = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #6773d4 0%, #7e529d 100%)',
  paddingTop: '40px',
  paddingBottom: '80px',
});

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
  
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editContent, setEditContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  const [aiAnchorEl, setAiAnchorEl] = useState<null | HTMLElement>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const isAiMenuOpen = Boolean(aiAnchorEl);

  // 👇 YENİ: Özel Talimat Pop-up State'leri
  const [customAiDialogOpen, setCustomAiDialogOpen] = useState<boolean>(false);
  const [customAiPrompt, setCustomAiPrompt] = useState<string>('');

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get(`https://dotproposal.onrender.com/api/proposals/${id}`, {
          headers: { Authorization: `Bearer ${token}` } 
        });
        setProposal(response.data);
        setEditContent(response.data.generatedCoverLetter);
      } catch (error) {
        console.error("Teklif yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchProposal();
  }, [id]);

  useEffect(() => {
    if (proposal && proposal.clientFeedback && !proposal.isClientFeedbackRead) {
      const markAsRead = async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.patch(`https://dotproposal.onrender.com/api/proposals/${proposal._id}/read-feedback`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error) {
          console.error("Otomatik okundu işaretlenemedi:", error);
        }
      };
      markAsRead();
    }
  }, [proposal]);

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://dotproposal.onrender.com/api/proposals/${id}`,
        { generatedCoverLetter: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProposal({ ...proposal!, generatedCoverLetter: editContent });
      setIsEditing(false);
      alert('Teklif başarıyla güncellendi! Müşteriniz artık bu yeni hali görecek.');
    } catch (error) {
      alert('Güncelleme sırasında bir hata oluştu.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiRewrite = async (instruction: string) => {
    setAiAnchorEl(null); 
    if (!editContent.trim()) return;
    
    setIsAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`https://dotproposal.onrender.com/api/proposals/enhance`,
        { text: editContent, instruction },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEditContent(response.data.enhancedText);
    } catch (error) {
      alert('Yapay zeka ile iletişim kurulurken bir hata oluştu.');
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

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

  const handleCopyLink = () => {
    const link = `${window.location.origin}/view/${proposal?._id}`;
    navigator.clipboard.writeText(link);
    alert('Müşteri linki kopyalandı! 🚀\n\nArtık bu linki müşterinize WhatsApp veya Mail üzerinden güvenle gönderebilirsiniz.');
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (!proposal) return <Typography align="center" mt={5}>Teklif bulunamadı.</Typography>;

  return (
    <PageWrapper>
      <Container maxWidth="md" sx={{ py: 4 }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} variant="outlined" href="/dashboard" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white' } }}>
            Geri Dön
          </Button>
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

        {proposal.clientFeedback && (
          <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 3, background: 'linear-gradient(to right, #e3f2fd, #bbdefb)', borderLeft: '6px solid #1976d2', animation: `${fadeUp} 0.5s ease both` }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <ForumIcon sx={{ color: '#1565c0' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1565c0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Müşteriden Yeni Mesaj Var!
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: '#0d47a1', fontStyle: 'italic', bgcolor: 'rgba(255,255,255,0.6)', p: 2, borderRadius: 2, mt: 1, fontWeight: 500 }}>
              "{proposal.clientFeedback}"
            </Typography>
          </Paper>
        )}

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

        <div ref={contentRef}>
          <Paper elevation={6} sx={{ p: 5, backgroundColor: '#ffffff', borderRadius: 2 }}>
            
            <Box sx={{ borderBottom: '2px solid #eee', pb: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
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
              
              <Box data-html2canvas-ignore>
                {isEditing ? (
                  <Box display="flex" gap={1} alignItems="center">
                    
                    <Button 
                      variant="contained" 
                      startIcon={isAiLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />} 
                      onClick={(e) => setAiAnchorEl(e.currentTarget)}
                      disabled={isAiLoading}
                      sx={{ background: 'linear-gradient(45deg, #9c27b0, #673ab7)', color: 'white', '&:hover': { background: 'linear-gradient(45deg, #7b1fa2, #512da8)' } }}
                    >
                      {isAiLoading ? 'YAZILIYOR...' : 'AI İLE İYİLEŞTİR'}
                    </Button>
                    
                    <Menu anchorEl={aiAnchorEl} open={isAiMenuOpen} onClose={() => setAiAnchorEl(null)}>
                      <MenuItem onClick={() => handleAiRewrite('professional')}>
                        <ListItemIcon><BusinessCenterIcon fontSize="small" sx={{ color: '#1976d2' }} /></ListItemIcon>
                        <ListItemText>Daha Profesyonel Yap</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => handleAiRewrite('shorter')}>
                        <ListItemIcon><ShortTextIcon fontSize="small" sx={{ color: '#e64a19' }} /></ListItemIcon>
                        <ListItemText>Daha Kısa ve Öz Yaz</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => handleAiRewrite('grammar')}>
                        <ListItemIcon><SpellcheckIcon fontSize="small" sx={{ color: '#388e3c' }} /></ListItemIcon>
                        <ListItemText>Yazım Hatalarını Düzelt</ListItemText>
                      </MenuItem>
                      <Divider />
                      {/* 👇 YENİ: ÖZEL TALİMAT SEÇENEĞİ */}
                      <MenuItem onClick={() => { setAiAnchorEl(null); setCustomAiDialogOpen(true); }}>
                        <ListItemIcon><AutoFixHighIcon fontSize="small" sx={{ color: '#9c27b0' }} /></ListItemIcon>
                        <ListItemText sx={{ fontWeight: 'bold', color: '#9c27b0' }}>Özel Talimat Ver...</ListItemText>
                      </MenuItem>
                    </Menu>

                    <Button variant="outlined" color="error" onClick={() => { setIsEditing(false); setEditContent(proposal.generatedCoverLetter); }} disabled={isAiLoading}>İptal</Button>
                    <Button variant="contained" color="success" startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} onClick={handleSaveEdit} disabled={isSaving || isAiLoading}>Kaydet</Button>
                  </Box>
                ) : (
                  <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>Metni Düzenle</Button>
                )}
              </Box>
            </Box>

            <Box className="markdown-content">
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  minRows={15}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  variant="outlined"
                  disabled={isAiLoading} 
                  sx={{ 
                    '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: 1.6 },
                    bgcolor: isAiLoading ? '#f0f0f0' : '#fafafa', 
                    transition: 'all 0.3s ease'
                  }}
                />
              ) : (
                <ReactMarkdown
                    components={{
                        h1: ({node, ...props}) => <Typography variant="h5" gutterBottom sx={{ mt: 3, color: '#1976d2', fontWeight: 'bold' }} {...props} />,
                        h2: ({node, ...props}) => <Typography variant="h6" gutterBottom sx={{ mt: 2, borderBottom:'1px solid #ddd' }} {...props} />,
                        p: ({node, ...props}) => <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }} {...props} />,
                        li: ({node, ...props}) => <li style={{ marginBottom: '8px' }} {...props} />,
                    }}
                >
                  {proposal.generatedCoverLetter.replace(/\\n/g, '\n')}
                </ReactMarkdown>
              )}
            </Box>

            <Divider sx={{ my: 4 }} />
            <Typography variant="caption" display="block" align="center" color="textSecondary">
              Bu teklif DotProposal Yapay Zeka sistemi tarafından otomatik oluşturulmuştur.
            </Typography>
          </Paper>
        </div>

        {/* 👇 YENİ: ÖZEL TALİMAT (CUSTOM PROMPT) POP-UP'I */}
        <Dialog open={customAiDialogOpen} onClose={() => setCustomAiDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 'bold', color: '#673ab7', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoFixHighIcon /> Yapay Zekaya Özel Talimat
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, mt: 1 }}>
              Metnin nasıl değiştirilmesini istediğinizi yazın. (Örn: "Daha samimi bir dil kullan", "Mobil uygulama kısmını daha detaylı anlat")
            </Typography>

            {/* Müşteriden mesaj gelmişse çıkacak özel alan */}
            {proposal.clientFeedback && (
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f3e5f5', borderRadius: 2, border: '1px solid #e1bee7' }}>
                <Typography variant="body2" sx={{ color: '#4a148c', fontStyle: 'italic', mb: 1.5, fontWeight: 500 }}>
                  💬 Müşteri Mesajı: "{proposal.clientFeedback}"
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  sx={{ bgcolor: '#8e24aa', color: 'white', '&:hover': { bgcolor: '#6a1b9a' } }}
                  onClick={() => setCustomAiPrompt(proposal.clientFeedback || '')}
                >
                  MESAJI TALİMAT OLARAK KULLAN
                </Button>
              </Box>
            )}

            <TextField
              autoFocus
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Talimatınızı buraya yazın..."
              value={customAiPrompt}
              onChange={(e) => setCustomAiPrompt(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setCustomAiDialogOpen(false)} color="error" sx={{ fontWeight: 'bold' }}>İPTAL</Button>
            <Button
              onClick={() => {
                setCustomAiDialogOpen(false);
                handleAiRewrite(customAiPrompt);
                setCustomAiPrompt('');
              }}
              variant="contained"
              disabled={!customAiPrompt.trim()}
              sx={{ background: 'linear-gradient(45deg, #9c27b0, #673ab7)', fontWeight: 'bold' }}
            >
              UYGULA
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </PageWrapper>
  );
};

export default ProposalDetail;