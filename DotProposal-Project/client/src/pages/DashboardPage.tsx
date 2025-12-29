/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Box, Chip, Divider, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { type RootState } from '../app/store';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

// Backend'den gelen verinin tipi (MongoDB Modeline Uygun)
interface Proposal {
  _id: string;
  jobTitle: string;
  jobDescription: string;
  companyName: string;
  createdAt: string;
  tone: string;
  selectedFeatures?: string[];
}

const DashboardPage: React.FC = () => {
  // const { history } = useSelector((state: RootState) => state.proposal); // ESKİ REDUX KALDIRILDI
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // ✅ YENİ: Verileri tutmak için State
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ YENİ: Backend'den Verileri Çekme
  useEffect(() => {
    const fetchProposals = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.get('http://localhost:5001/api/proposals', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProposals(response.data);
        } catch (error) {
            console.error("Teklifler çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchProposals();
  }, [navigate]);

  // ✅ GÜNCELLENDİ: Silme İşlemi
  const handleDelete = async (id: string) => {
    if (window.confirm(t('dashboard.deleteConfirm', 'Bu teklifi silmek istediğinize emin misiniz?'))) {
      try {
        // Backend API Silme İsteği (İsteğe bağlı açılabilir)
        // const token = localStorage.getItem('token');
        // await axios.delete(`http://localhost:5001/api/proposals/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        
        // Listeden sil (UI güncelleme)
        setProposals(proposals.filter(p => p._id !== id));
      } catch (error) {
        console.error("Silme hatası:", error);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      {/* BAŞLIK ALANI */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t('dashboard.title', 'Teklif Panelim')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('dashboard.welcome', 'Hoş geldin')}, <strong>{user?.name}</strong>. 
            {t('dashboard.totalProposals', 'Toplam {{count}} teklifiniz var.', { count: proposals.length })}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          size="large" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/wizard')}
        >
          {t('nav.createProposal', 'Yeni Teklif Oluştur')}
        </Button>
      </Box>

      {/* LİSTELEME ALANI */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
             <CircularProgress />
        </Box>
      ) : proposals.length === 0 ? (
        // Eğer hiç teklif yoksa bu görünür
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 10, 
            bgcolor: 'background.paper', 
            borderRadius: 4, 
            border: '2px dashed',
            borderColor: 'divider'
          }}
        >
          <DescriptionIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('dashboard.noProposals', 'Henüz oluşturulmuş bir teklifiniz yok.')}
          </Typography>
          <Button variant="text" onClick={() => navigate('/wizard')}>
            {t('dashboard.createFirst', 'İlk teklifini şimdi oluştur!')}
          </Button>
        </Box>
      ) : (
        // Teklifler varsa kartlar görünür
        <Grid container spacing={3}>
          {proposals.map((item) => (
            <Grid key={item._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  
                  {/* Kart Üst Bilgi: Chip ve Tarih */}
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Chip label={item.tone || 'Standart'} color="primary" size="small" variant="outlined" />
                    <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                        <EventIcon fontSize="small" />
                        <Typography variant="caption">
                            {/* "Invalid Date" ÇÖZÜMÜ: createdAt kullanıldı */}
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'tr-TR') : '-'}
                        </Typography>
                    </Box>
                  </Box>
                  
                  {/* Başlık (İş Adı) */}
                  <Typography variant="h6" fontWeight="bold" noWrap title={item.jobTitle}>
                    {item.jobTitle}
                  </Typography>

                  {/* Şirket Adı */}
                  <Box display="flex" alignItems="center" gap={1} mb={1} color="text.secondary">
                    <BusinessIcon fontSize="small" />
                    <Typography variant="body2" noWrap>
                        {item.companyName}
                    </Typography>
                  </Box>
                  
                  {/* Açıklama */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {item.jobDescription || t('dashboard.noDesc', 'Açıklama yok')}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  {/* Alt Bilgi */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      {item.selectedFeatures ? item.selectedFeatures.length : 0} {t('dashboard.items', 'Özellik')}
                    </Typography>
                    {/* Fiyat alanı yerine Ton bilgisi veya boş bırakılabilir */}
                  </Box>
                </CardContent>
                
                {/* BUTONLAR */}
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  {/* 🚨 DÜZELTME: disabled kaldırıldı, onClick eklendi */}
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="primary"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/proposal/${item._id}`)} 
                  >
                    {t('dashboard.details', 'Detay Gör')}
                  </Button>

                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(item._id)}
                  >
                    {t('dashboard.delete', 'Sil')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default DashboardPage;