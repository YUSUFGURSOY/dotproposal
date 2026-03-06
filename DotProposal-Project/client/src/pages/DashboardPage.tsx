// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent, CardActions, Button, Box, Chip,
  CircularProgress, Stack, Paper, Avatar, 
  Select, MenuItem, FormControl, IconButton,Tooltip as MuiTooltip // 👇 IconButton Eklendi
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
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ForumIcon from '@mui/icons-material/Forum';
// 👇 YENİ: Raptiye İkonları
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/system';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Proposal {
  _id: string;
  jobTitle: string;
  jobDescription: string;
  companyName: string;
  createdAt: string;
  tone: string;
  selectedFeatures?: string[];
  aiInsights?: string[];
  isViewed?: boolean;
  viewedAt?: string;
  dealStatus?: string;
  clientFeedback?: string;
  clientFeedbackDate?: string; 
  isClientFeedbackRead?: boolean; 
  isPinned?: boolean; // 👇 YENİ
}

const timeSince = (dateString?: string) => {
  if (!dateString) return '';
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  let interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " gün";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " saat";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " dk";
  return "Az önce";
};

const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5001/api/proposals/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProposals(proposals.filter((p) => p._id !== id));
      } catch (error) {
        console.error('Silme hatası:', error);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5001/api/proposals/${id}/status`, 
        { dealStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProposals(proposals.map(p => p._id === id ? { ...p, dealStatus: newStatus } : p));
    } catch (error) {
      console.error('Statü güncellenirken hata oluştu:', error);
    }
  };

  // 👇 YENİ: RAPTİYE TIKLAMA FONKSİYONU
  const handleTogglePin = async (id: string, currentPinStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      // Arka plana anında istek at
      await axios.patch(`http://localhost:5001/api/proposals/${id}/pin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Arayüzü anında güncelle (sayfa yenilemeye gerek kalmadan)
      setProposals(proposals.map(p => p._id === id ? { ...p, isPinned: !currentPinStatus } : p));
    } catch (error) {
      console.error('Sabitleme işlemi başarısız:', error);
    }
  };

  const acceptedCount = proposals.filter(p => p.dealStatus === 'Kabul Edildi').length;
  const rejectedCount = proposals.filter(p => p.dealStatus === 'Reddedildi').length;
  const totalResponded = acceptedCount + rejectedCount;
  const winRate = totalResponded > 0 ? Math.round((acceptedCount / totalResponded) * 100) : 0;

  const chartData = [
    { name: 'Kabul', value: acceptedCount, color: '#4caf50' },
    { name: 'İletildi', value: proposals.filter(p => p.dealStatus === 'İletildi').length, color: '#2196f3' },
    { name: 'Red', value: rejectedCount, color: '#f44336' },
    { name: 'Taslak', value: proposals.filter(p => p.dealStatus === 'Taslak' || !p.dealStatus).length, color: '#9e9e9e' }
  ].filter(data => data.value > 0);

  // 👇 GÜNCELLENEN AKILLI SIRALAMA ALGORİTMASI
  const sortedProposals = [...proposals].sort((a, b) => {
    // 1. VIP ÖNCELİK: Raptiyelenmiş (Sabitlenmiş) teklifler HER ZAMAN en üstte!
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    // 2. ÖNCELİK: Okunmamış yeni müşteri mesajı olanlar
    const aHasUnread = a.clientFeedback && a.clientFeedback.trim() !== '' && !a.isClientFeedbackRead;
    const bHasUnread = b.clientFeedback && b.clientFeedback.trim() !== '' && !b.isClientFeedbackRead;

    if (aHasUnread && !bHasUnread) return -1;
    if (!aHasUnread && bHasUnread) return 1;

    // 3. ÖNCELİK: En son harekete (Aktiviteye) göre sırala
    const getLatestActivityDate = (p: Proposal) => {
      const dates = [new Date(p.createdAt).getTime()];
      if (p.viewedAt) dates.push(new Date(p.viewedAt).getTime());
      if (p.clientFeedbackDate) dates.push(new Date(p.clientFeedbackDate).getTime());
      return Math.max(...dates);
    };

    return getLatestActivityDate(b) - getLatestActivityDate(a); 
  });

  return (
    <Box sx={{ background: gradientBg, minHeight: '100vh', py: 8 }}>
      <Container maxWidth="lg">
        {/* --- HEADER BANNER --- */}
        <Paper elevation={8} sx={{ p: 5, mb: 5, borderRadius: 5, background: alpha('#fff', 0.15), backdropFilter: 'blur(20px)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
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
              variant="contained" size="large" startIcon={<AddIcon />} onClick={() => navigate('/wizard')}
              sx={{ px: 5, py: 2, fontWeight: 'bold', borderRadius: 3, fontSize: '1.1rem', background: 'linear-gradient(45deg,#ffd54f,#ff8a65)', color: 'white', boxShadow: '0 10px 25px rgba(255,213,79,0.4)', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 15px 35px rgba(255,213,79,0.6)' } }}
            >
              {t('nav.createProposal', 'Yeni Teklif Oluştur')}
            </Button>
          </Stack>
        </Paper>

        {/* --- İSTATİSTİK KARTLARI --- */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 5 }}>
          {[
            { label: 'Toplam Teklif', value: proposals.length, icon: <DescriptionIcon />, color: '#667eea' },
            { label: 'Bu Ay', value: proposals.filter((p) => new Date(p.createdAt).getMonth() === new Date().getMonth()).length, icon: <TrendingUpIcon />, color: '#4ecdc4' },
            { label: 'Kabul Edilen', value: acceptedCount, isChart: true, color: '#4caf50' }, 
            { label: 'Kazanma Oranı', value: `%${winRate}`, icon: <EmojiEventsIcon />, color: '#ffb300' }, 
          ].map((stat, index) => (
            <Paper
              key={index} elevation={4}
              sx={{ p: 3, borderRadius: 4, background: alpha('#fff', 0.95), backdropFilter: 'blur(10px)', border: `1px solid ${alpha(stat.color, 0.2)}`, transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 15px 35px ${alpha(stat.color, 0.3)}` } }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                
                {stat.isChart ? (
                  <Box sx={{ width: 56, height: 56, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} innerRadius={18} outerRadius={26} paddingAngle={3} dataKey="value" stroke="none">
                          {chartData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          cursor={false}
                          contentStyle={{ borderRadius: '8px', padding: '4px 8px', fontSize: '0.75rem', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                          itemStyle={{ color: '#333', fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color, width: 50, height: 50 }}>
                    {stat.icon}
                  </Avatar>
                )}

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
        ) : sortedProposals.length === 0 ? (
          <Paper elevation={6} sx={{ textAlign: 'center', py: 10, px: 4, borderRadius: 5, background: alpha('#fff', 0.1), backdropFilter: 'blur(10px)', border: '2px dashed rgba(255,255,255,0.3)', color: 'white' }}>
            <DescriptionIcon sx={{ fontSize: 80, mb: 3, opacity: 0.5 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>{t('dashboard.noProposals', 'Henüz oluşturulmuş bir teklifiniz yok.')}</Typography>
            <Button variant="outlined" size="large" onClick={() => navigate('/wizard')} sx={{ mt: 3, color: 'white', borderColor: 'white' }}>{t('dashboard.createFirst', 'İlk teklifini şimdi oluştur!')}</Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            {sortedProposals.map((item) => ( 
              
              <Card key={item._id} elevation={6} sx={{ position: 'relative', borderRadius: 4, background: alpha('#fff', 0.95), backdropFilter: 'blur(10px)', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' } }}>
               
               {/* 👇 YENİ: KARTIN SAĞ ÜST KÖŞESİNDEKİ RAPTİYE İKONU */}
               <MuiTooltip title={item.isPinned ? "Sabitlemeyi Kaldır" : "En Üste Sabitle"} placement="top" arrow>
                 <IconButton
                   onClick={() => handleTogglePin(item._id, !!item.isPinned)}
                   sx={{
                     position: 'absolute',
                     top: 8,
                     right: 8,
                     zIndex: 10,
                     color: item.isPinned ? '#ffb300' : 'rgba(0,0,0,0.15)',
                     backgroundColor: item.isPinned ? 'rgba(255,179,0,0.1)' : 'transparent',
                     '&:hover': { backgroundColor: 'rgba(255,179,0,0.2)', color: '#ffb300' }
                   }}
                 >
                   {item.isPinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
                 </IconButton>
               </MuiTooltip>

               <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>

  {/* ── TOP GRADIENT BAND ── */}
  <Box
    sx={{
      px: 2.5,
      pt: 2.5,
      pb: 2,
      // Raptiye ikonuna yer açmak için sağ padding'i artırdık (pr: 5)
      pr: 5,
      background:
        item.dealStatus === 'Kabul Edildi'
          ? 'linear-gradient(135deg, rgba(46,125,50,0.08) 0%, rgba(76,175,80,0.04) 100%)'
          : item.dealStatus === 'Reddedildi'
          ? 'linear-gradient(135deg, rgba(198,40,40,0.08) 0%, rgba(244,67,54,0.04) 100%)'
          : item.dealStatus === 'İletildi'
          ? 'linear-gradient(135deg, rgba(21,101,192,0.08) 0%, rgba(33,150,243,0.04) 100%)'
          : 'linear-gradient(135deg, rgba(97,97,97,0.06) 0%, rgba(158,158,158,0.02) 100%)',
      borderBottom: '1px solid',
      borderColor:
        item.dealStatus === 'Kabul Edildi' ? 'rgba(76,175,80,0.12)' :
        item.dealStatus === 'Reddedildi' ? 'rgba(244,67,54,0.12)' :
        item.dealStatus === 'İletildi' ? 'rgba(33,150,243,0.12)' :
        'rgba(0,0,0,0.05)',
    }}
  >
    {/* Row 1: Status + Date */}
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
      <FormControl size="small">
        <Select
          value={item.dealStatus || 'Taslak'}
          onChange={(e) => handleStatusChange(item._id, e.target.value)}
          sx={{
            height: 26,
            fontSize: '0.7rem',
            fontWeight: 700,
            borderRadius: '999px',
            letterSpacing: '0.04em',
            backgroundColor:
              item.dealStatus === 'Kabul Edildi' ? 'rgba(76,175,80,0.15)' :
              item.dealStatus === 'Reddedildi' ? 'rgba(244,67,54,0.12)' :
              item.dealStatus === 'İletildi' ? 'rgba(33,150,243,0.12)' :
              'rgba(0,0,0,0.06)',
            color:
              item.dealStatus === 'Kabul Edildi' ? '#2e7d32' :
              item.dealStatus === 'Reddedildi' ? '#c62828' :
              item.dealStatus === 'İletildi' ? '#1565c0' : '#616161',
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiSelect-select': { py: 0, px: 1.5 },
            '& .MuiSvgIcon-root': { fontSize: '0.9rem' },
          }}
        >
          <MenuItem value="Taslak"    sx={{ fontSize: '0.82rem' }}>📝 Taslak</MenuItem>
          <MenuItem value="İletildi"  sx={{ fontSize: '0.82rem' }}>🚀 İletildi</MenuItem>
          <MenuItem value="Kabul Edildi" sx={{ fontSize: '0.82rem', color: 'success.main', fontWeight: 700 }}>🎉 Kabul Edildi</MenuItem>
          <MenuItem value="Reddedildi"   sx={{ fontSize: '0.82rem', color: 'error.main' }}>❌ Reddedildi</MenuItem>
        </Select>
      </FormControl>

      <Stack direction="row" alignItems="center" spacing={0.5}>
        {item.isViewed && (
          <Chip
            label="👀 Görüldü"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 700,
              background: 'rgba(76,175,80,0.1)',
              color: '#388e3c',
              border: '1px solid rgba(76,175,80,0.25)',
              borderRadius: '999px',
              '& .MuiChip-label': { px: 1 },
            }}
          />
        )}
        <Stack direction="row" alignItems="center" spacing={0.4} color="text.disabled">
          <EventIcon sx={{ fontSize: 13 }} />
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.02em' }}>
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString(
                  i18n.language === 'en' ? 'en-US' : 'tr-TR'
                )
              : '—'}
          </Typography>
        </Stack>
      </Stack>
    </Stack>

    {/* Job Title */}
    <Typography
      variant="h6"
      fontWeight={800}
      noWrap
      title={item.jobTitle}
      sx={{ fontSize: '1rem', lineHeight: 1.3, letterSpacing: '-0.01em', mb: 0.5 }}
    >
      {item.jobTitle}
    </Typography>

    {/* Company */}
    <Stack direction="row" alignItems="center" spacing={0.75} color="text.secondary">
      <BusinessIcon sx={{ fontSize: 14 }} />
      <Typography variant="body2" noWrap sx={{ fontSize: '0.78rem', fontWeight: 500 }}>
        {item.companyName}
      </Typography>
    </Stack>
  </Box>

        {/* ── MIDDLE CONTENT ── */}
        <Box sx={{ px: 2.5, py: 2 }}>

          {/* 💬 AKILLI MESAJ BİLDİRİM PANELİ */}
          {item.clientFeedback && item.clientFeedback.trim() !== '' && (
            <Box
              sx={{
                mb: 2,
                px: 1.5,
                py: 1.2,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: item.isClientFeedbackRead 
                  ? '#f5f5f5' 
                  : 'linear-gradient(90deg, #e3f2fd 0%, #ede7f6 100%)',
                borderLeft: `4px solid ${item.isClientFeedbackRead ? '#9e9e9e' : '#1976d2'}`,
                boxShadow: item.isClientFeedbackRead ? 'none' : '0 2px 12px rgba(25,118,210,0.12)',
              }}
            >
              <Box display="flex" alignItems="center" gap={1.2}>
                {!item.isClientFeedbackRead && (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f44336', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
                )}
                
                <ForumIcon sx={{ color: item.isClientFeedbackRead ? '#9e9e9e' : '#1565c0', fontSize: 18, flexShrink: 0 }} />
                
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: item.isClientFeedbackRead ? '#757575' : '#0d47a1',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.isClientFeedbackRead ? 'Önceki Mesaj' : 'Müşteriden Yeni Mesaj'}
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', fontSize: '0.7rem' }}>
                {timeSince(item.clientFeedbackDate)}
              </Typography>
            </Box>
          )}
    {/* Description */}
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{
        fontSize: '0.78rem',
        lineHeight: 1.65,
        height: '52px',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
      }}
    >
      {item.jobDescription || t('dashboard.noDesc', 'Açıklama yok')}
    </Typography>
  </Box>

  {/* ── BOTTOM FOOTER ── */}
  <Box
    sx={{
      px: 2.5,
      py: 1.5,
      borderTop: '1px solid',
      borderColor: 'divider',
      background: 'rgba(0,0,0,0.018)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
    }}
  >
    {/* Feature count pill */}
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        px: 1.2,
        py: 0.4,
        borderRadius: '999px',
        background: 'rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.07)',
      }}
    >
      <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary' }}>
        {item.selectedFeatures ? item.selectedFeatures.length : 0}
      </Typography>
      <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled' }}>
        {t('dashboard.items', 'Özellik')}
      </Typography>
    </Box>

    {/* AI insights chip */}
    {item.aiInsights && item.aiInsights.length > 0 && (
      <Chip
        icon={<AutoAwesomeIcon sx={{ color: '#A3ADF0 !important', fontSize: 13 }} />}
        label={`${item.aiInsights.length} Gizli Tavsiye`}
        size="small"
        sx={{
          height: 24,
          fontSize: '0.68rem',
          fontWeight: 700,
          fontFamily: '"Sora", sans-serif',
          background: 'linear-gradient(90deg, rgba(108,120,214,0.12), rgba(163,173,240,0.12))',
          color: '#A3ADF0',
          border: '1px solid rgba(108,120,214,0.3)',
          borderRadius: '999px',
          '& .MuiChip-label': { px: 1 },
          '& .MuiChip-icon': { ml: 0.8 },
        }}
      />
    )}
  </Box>

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