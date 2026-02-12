/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Stack,
  Paper,
  Avatar,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { type RootState } from '../app/store';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { keyframes, alpha } from '@mui/system';

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
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 🔹 Animations
  const float = keyframes`
    0% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
    100% { transform: translateY(0); }
  `;

  const gradientBg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  useEffect(() => {
    const fetchProposals = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5001/api/proposals', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProposals(response.data);
      } catch (error) {
        console.error('Teklifler çekilemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [navigate]);

  const handleDelete = async (id: string) => {
    if (window.confirm(t('dashboard.deleteConfirm', 'Bu teklifi silmek istediğinize emin misiniz?'))) {
      try {
        setProposals(proposals.filter((p) => p._id !== id));
      } catch (error) {
        console.error('Silme hatası:', error);
      }
    }
  };

  return (
    <Box
      sx={{
        background: gradientBg,
        minHeight: '100vh',
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        {/* --- HEADER BANNER --- */}
        <Paper
          elevation={8}
          sx={{
            p: 5,
            mb: 5,
            borderRadius: 5,
            background: alpha('#fff', 0.15),
            backdropFilter: 'blur(20px)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              filter: 'blur(40px)',
            }}
          />

          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={3}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" fontWeight="900" gutterBottom>
                {t('dashboard.title', 'Teklif Panelim')}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {t('dashboard.welcome', 'Hoş geldin')}, <strong>{user?.name}</strong>! 🚀
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
                {t('dashboard.totalProposals', 'Toplam {{count}} teklifiniz var.', { count: proposals.length })}
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate('/wizard')}
              sx={{
                px: 5,
                py: 2,
                fontWeight: 'bold',
                borderRadius: 3,
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg,#ffd54f,#ff8a65)',
                color: 'white',
                boxShadow: '0 10px 25px rgba(255,213,79,0.4)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 15px 35px rgba(255,213,79,0.6)',
                },
              }}
            >
              {t('nav.createProposal', 'Yeni Teklif Oluştur')}
            </Button>
          </Stack>
        </Paper>

        {/* --- İSTATİSTİK KARTLARI --- */}
        <Box sx={{ display: 'flex', gap: 3, mb: 5, flexWrap: 'wrap' }}>
          {[
            { label: 'Toplam Teklif', value: proposals.length, icon: <DescriptionIcon />, color: '#667eea' },
            { label: 'Bu Ay', value: proposals.filter((p) => new Date(p.createdAt).getMonth() === new Date().getMonth()).length, icon: <TrendingUpIcon />, color: '#4ecdc4' },
            { label: 'AI Destekli', value: proposals.length, icon: <AutoAwesomeIcon />, color: '#ff6b6b' },
          ].map((stat, index) => (
            <Paper
              key={index}
              elevation={4}
              sx={{
                flex: 1,
                minWidth: 200,
                p: 3,
                borderRadius: 4,
                background: alpha('#fff', 0.95),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(stat.color, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 15px 35px ${alpha(stat.color, 0.3)}`,
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color, width: 50, height: 50 }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="text.primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Box>

        {/* --- TEKLİF LİSTESİ --- */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress sx={{ color: 'white' }} size={60} />
          </Box>
        ) : proposals.length === 0 ? (
          <Paper
            elevation={6}
            sx={{
              textAlign: 'center',
              py: 10,
              px: 4,
              borderRadius: 5,
              background: alpha('#fff', 0.1),
              backdropFilter: 'blur(10px)',
              border: '2px dashed rgba(255,255,255,0.3)',
              color: 'white',
            }}
          >
            <DescriptionIcon sx={{ fontSize: 80, mb: 3, opacity: 0.5 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {t('dashboard.noProposals', 'Henüz oluşturulmuş bir teklifiniz yok.')}
            </Typography>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/wizard')}
              sx={{ mt: 3, color: 'white', borderColor: 'white' }}
            >
              {t('dashboard.createFirst', 'İlk teklifini şimdi oluştur!')}
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            {proposals.map((item) => (
              <Card
                key={item._id}
                elevation={6}
                sx={{
                  borderRadius: 4,
                  background: alpha('#fff', 0.95),
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                    <Chip label={item.tone || 'Standart'} color="primary" size="small" />
                    <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary">
                      <EventIcon fontSize="small" />
                      <Typography variant="caption">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'tr-TR') : '-'}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Typography variant="h6" fontWeight="bold" noWrap title={item.jobTitle} mb={1}>
                    {item.jobTitle}
                  </Typography>

                  <Stack direction="row" alignItems="center" spacing={1} mb={2} color="text.secondary">
                    <BusinessIcon fontSize="small" />
                    <Typography variant="body2" noWrap>
                      {item.companyName}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      height: '40px',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.jobDescription || t('dashboard.noDesc', 'Açıklama yok')}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="text.secondary">
                    {item.selectedFeatures ? item.selectedFeatures.length : 0} {t('dashboard.items', 'Özellik')}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button size="small" variant="contained" startIcon={<VisibilityIcon />} onClick={() => navigate(`/proposal/${item._id}`)}>
                    {t('dashboard.details', 'Detay')}
                  </Button>
                  <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(item._id)}>
                    {t('dashboard.delete', 'Sil')}
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default DashboardPage;
