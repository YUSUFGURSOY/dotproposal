import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid,
  Paper, 
  Stack,
  Avatar,
  Chip,
  alpha
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BoltIcon from '@mui/icons-material/Bolt';
import { keyframes } from '@mui/system';
import { useSelector } from 'react-redux';
// SADECE FRAMER MOTION KULLANIYORUZ (HATA VERMEZ)
import { motion } from 'framer-motion';
import type { RootState } from '../app/store';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
 const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  // Geliştirilmiş Animasyonlar (CSS Keyframes - Orijinal Kodun)
  const float = keyframes`
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-25px) rotate(180deg); }
  `;

  const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.08); opacity: 0.85; }
  `;

  const slideIn = keyframes`
    from { transform: translateX(-80px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  `;

  const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  `;

  const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  `;

  const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.4), 0 0 40px rgba(102, 126, 234, 0.2); }
    50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.6), 0 0 60px rgba(102, 126, 234, 0.3); }
  `;

 return (
  <Box sx={{ 
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    minHeight: '100vh',
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    overflowX: 'hidden',
    maxWidth: '100vw'
  }}>
      
      {/* 1. ÖZELLİK: NOISE TEXTURE (KODLA YAPILAN GÜRÜLTÜ EFEKTİ - HATA VERMEZ) */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        opacity: 0.035,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
        zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />

      {/* Gelişmiş Arka Plan Efektleri */}
      <Box sx={{ 
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.15) 0%, transparent 50%)',
        animation: `${pulse} 8s ease-in-out infinite`
      }} />

      {/* Animasyonlu Grid Pattern */}
      <Box sx={{ 
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(102, 126, 234, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(102, 126, 234, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100px 100px',
        opacity: 0.6,
        animation: `${shimmer} 20s linear infinite`,
        backgroundPosition: '0 0'
      }} />

      {/* Yüzen Geometrik Şekiller - Orijinal Kod */}
      <Box sx={{ 
        position: 'absolute',
        top: '15%',
        right: '8%',
        width: { xs: 200, md: 500 },
        height: { xs: 200, md: 500 },
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: `${float} 10s ease-in-out infinite`
      }} />
      
      <Box sx={{ 
        position: 'absolute',
        bottom: '10%',
        left: '5%',
        width: { xs: 150, md: 350 }, 
        height: { xs: 150, md: 350 },
        background: 'radial-gradient(circle, rgba(255, 107, 107, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)',
        animation: `${float} 7s ease-in-out infinite reverse`
      }} />

      <Box sx={{ 
        position: 'absolute',
        top: '40%',
        left: '15%',
        width: { xs: 100, md: 200 },
        height: { xs: 100, md: 200 },
        background: 'conic-gradient(from 0deg, rgba(78, 205, 196, 0.08), transparent)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: `${rotate} 15s linear infinite`
      }} />

      {/* --- HERO BÖLÜMÜ --- */}
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        pt: { xs: 8, md: 4 }
      }}>
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 ,px: { xs: 2, md: 6, lg: 12 }}}>
          <Grid container spacing={4} alignItems="center">
            
            {/* Sol Taraf - Hero Content */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ animation: `${slideIn} 1s ease-out` }}>
                
                {/* Status Badge */}
                <Box sx={{ 
  mb: 4, 
  display: { xs: 'none', md: 'flex' }, // Mobilde gizle (none), masaüstünde göster (flex)
  justifyContent: 'flex-start' 
}}>
  <Chip 
    icon={<RocketLaunchIcon sx={{ color: 'white', animation: `${pulse} 2s infinite` }} />}
    label="Türkiye'nin #1 AI Teklif Platformu"
    sx={{ 
      px: 3,
      py: 2.5,
      height: 'auto',
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%)',
      backdropFilter: 'blur(20px)',
      border: '1.5px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '50px',
      color: 'white',
      fontWeight: 700,
      fontSize: '0.95rem',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.25)',
      '& .MuiChip-label': { px: 1.5 }
    }}
  />
</Box>

                {/* Heading */}
            <Typography 
  variant="h1" 
  sx={{ 
    // xs: Telefon, sm: Tablet, md: Masaüstü
    // sm (600px+) değerini 4rem yaparak tableti de masaüstü görkemine yaklaştırdık
    fontSize: { xs: '3.2rem', sm: '4rem', md: '4.5rem', lg: '5rem' },
    fontWeight: 900,
    // Satır aralığını her ekranda sıkı tutarak modern görünümü koruduk
    lineHeight: { xs: 1.1, sm: 1.05 },
    // Tablet ve üstünde daha fazla boşluk bıraktık
    mb: { xs: 3, sm: 5, md: 6 },
    background: 'linear-gradient(135deg, #ffffff 0%, #e8eaf6 50%, #c5cae9 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    textShadow: '0 0 80px rgba(102, 126, 234, 0.5)',
    letterSpacing: '-0.02em',
    textAlign: 'left' // Sola yaslı duruşu sabitledik
  }}
>
  Teklifleri
  <br />
  <Box component="span" sx={{ 
    display: 'inline-block',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      // Alt çizgi kalınlığını ve konumunu tablet için de büyüttük
      bottom: { xs: -5, sm: -8, md: -12 }, 
      left: 0,
      right: 0,
      height: { xs: '4px', sm: '6px', md: '8px' }, 
      background: 'linear-gradient(90deg, #667eea, #764ba2)',
      borderRadius: '3px',
      animation: `${shimmer} 3s linear infinite`
    }
  }}>
    Saniyede Üret
  </Box>
</Typography>

                {/* Subtitle */}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 5,
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontWeight: 400,
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    lineHeight: 1.75,
                    maxWidth: '620px',
                    letterSpacing: '0.01em'
                  }}
                >
                  Yapay zeka gücüyle profesyonel teklifleri 
                  <Box component="span" sx={{ 
                    color: '#ffd54f',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #ffd54f, #ffab40)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    mx: 0.5
                  }}>
                    ışık hızında
                  </Box>
                  oluşturun. Müşterilerinizi büyüleyin, işinizi büyütün.
                </Typography>

                {/* Stats Row */}
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={4} 
                  mb={6}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {[
                    { value: '15K+', label: 'Oluşturulan Teklif', icon: <DescriptionIcon /> },
                    { value: '98%', label: 'Kazanma Oranı', icon: <TrendingUpIcon /> },
                    { value: '12sn', label: 'Ortalama Süre', icon: <BoltIcon /> }
                  ].map((stat, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        flex: 1,
                        textAlign: { xs: 'left', sm: 'center' },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexDirection: { xs: 'row', sm: 'column' }
                      }}
                    >
                      <Box sx={{ 
                        color: '#667eea',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography 
                          variant="h3" 
                          fontWeight="900" 
                          sx={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            fontSize: { xs: '1.5rem', md: '2rem' }
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>

                {/* CTA Buttons */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                  
  <Button
    variant="contained"
    size="large"
    onClick={() => {
      if (isAuthenticated) {
        navigate('/wizard');
      } else {
        navigate('/login');
      }
    }}
    endIcon={<ArrowForwardIcon />}
    sx={{
      px: 7,
      py: 2.5,
      fontSize: '1.25rem',
      fontWeight: 800,
      borderRadius: '50px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4), 0 0 0 0 rgba(102, 126, 234, 0.5)',
      border: 'none',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        transition: 'left 0.5s'
      },
      '&:hover': {
        transform: 'translateY(-4px) scale(1.02)',
        boxShadow: '0 15px 50px rgba(102, 126, 234, 0.6), 0 0 0 4px rgba(102, 126, 234, 0.3)',
        background: 'linear-gradient(135deg, #5568d3 0%, #6941a6 100%)',
        '&::before': {
          left: '100%'
        }
      },
      '&:active': {
        transform: 'translateY(-2px) scale(0.98)'
      }
    }}
  >
    Hemen Başla
  </Button>

                </Stack>

                {/* Trust Badge */}
                <Stack direction="row" spacing={3} mt={5} alignItems="center">
                  <Stack direction="row" spacing={0.5}>
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} sx={{ color: '#ffd54f', fontSize: 22 }} />
                    ))}
                  </Stack>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)" fontWeight={600}>
                    4.9/5 · 2,500+ Mutlu Kullanıcı
                  </Typography>
                </Stack>
              </Box>
            </Grid>

            {/* Sağ Taraf - Dashboard Preview */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ 
                position: 'relative',
                display: { xs: 'none', lg: 'block' }
              }}>
                <Box sx={{
                  position: 'absolute',
                  inset: -50,
                  background: 'radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%)',
                  filter: 'blur(60px)',
                  animation: `${glow} 3s ease-in-out infinite`,
                  zIndex: 0
                }} />

                <Paper sx={{
                  p: 5,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
                  backdropFilter: 'blur(30px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 30px 90px rgba(0,0,0,0.35), 0 0 0 1px rgba(102, 126, 234, 0.1)',
                  transform: 'perspective(1200px) rotateY(-4deg) rotateX(2deg)',
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  zIndex: 1,
                  '&:hover': {
                    transform: 'perspective(1200px) rotateY(0deg) rotateX(0deg) translateY(-10px)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.4), 0 0 0 2px rgba(102, 126, 234, 0.2)'
                  }
                }}>
                  {/* Dashboard içeriği (Orijinal ile aynı) */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
                      }}>
                        <AutoAwesomeIcon sx={{ fontSize: 20, color: 'white' }} />
                      </Box>
                      <Typography variant="h6" fontWeight="800" sx={{ 
                        background: 'linear-gradient(135deg, #1a1a2e, #667eea)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent'
                      }}>
                        AI Teklif Motoru
                      </Typography>
                    </Stack>
                    <Chip 
                      label="CANLI" 
                      size="small"
                      sx={{ 
                        bgcolor: '#4caf50',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 24,
                        animation: `${pulse} 2s infinite`,
                        boxShadow: '0 0 15px rgba(76, 175, 80, 0.5)'
                      }} 
                    />
                  </Stack>

                  <Box sx={{ mb: 5 }}>
                    <Stack direction="row" justifyContent="space-between" mb={2}>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        Teklif Üretiliyor...
                      </Typography>
                      <Typography variant="h6" fontWeight="800" sx={{ 
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent'
                      }}>
                        84%
                      </Typography>
                    </Stack>
                    <Box sx={{ 
                      width: '100%', 
                      height: 12, 
                      bgcolor: '#f5f5f5', 
                      borderRadius: 6,
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                    }}>
                      <Box sx={{ 
                        width: '84%', 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
                        backgroundSize: '200% 100%',
                        borderRadius: 6,
                        position: 'relative',
                        animation: `${shimmer} 2s linear infinite`,
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                          animation: `${shimmer} 1.5s linear infinite`
                        }
                      }} />
                    </Box>
                  </Box>

                  <Stack spacing={3}>
                    <Box>
                      <Box sx={{ 
                        width: '70%', 
                        height: 16, 
                        background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
                        backgroundSize: '200% 100%',
                        borderRadius: 2,
                        mb: 1.5,
                        animation: `${shimmer} 1.5s linear infinite`
                      }} />
                      <Box sx={{ 
                        width: '45%', 
                        height: 12, 
                        background: 'linear-gradient(90deg, #f5f5f5 25%, #fafafa 50%, #f5f5f5 75%)',
                        backgroundSize: '200% 100%',
                        borderRadius: 2,
                        animation: `${shimmer} 1.5s linear infinite`
                      }} />
                    </Box>
                    
                    <Stack spacing={1.5}>
                      {[95, 88, 92, 78].map((width, i) => (
                        <Box key={i} sx={{ 
                          width: `${width}%`, 
                          height: 8, 
                          background: 'linear-gradient(90deg, #fafafa 25%, #ffffff 50%, #fafafa 75%)',
                          backgroundSize: '200% 100%',
                          borderRadius: 1,
                          animation: `${shimmer} 1.5s linear infinite`,
                          animationDelay: `${i * 0.1}s`
                        }} />
                      ))}
                    </Stack>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      {[
                        { icon: <SpeedIcon />, title: 'Hızlı', color: '#667eea' },
                        { icon: <CheckCircleIcon />, title: 'Hazır PDF', color: '#4caf50' }
                      ].map((item, index) => (
                        <Grid size={6} key={index}>
                          <Paper sx={{ 
                            p: 2.5,
                            borderRadius: 4,
                            background: `linear-gradient(135deg, ${alpha(item.color, 0.08)} 0%, ${alpha(item.color, 0.03)} 100%)`,
                            border: `2px solid ${alpha(item.color, 0.15)}`,
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: `0 8px 20px ${alpha(item.color, 0.2)}`,
                              border: `2px solid ${alpha(item.color, 0.3)}`
                            }
                          }}>
                            <Box sx={{ color: item.color, mb: 1 }}>
                              {item.icon}
                            </Box>
                            <Typography variant="body2" fontWeight="700" sx={{ color: 'text.primary' }}>
                              {item.title}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Stack>
                </Paper>

                <Box sx={{ 
                  position: 'absolute', 
                  top: -30, 
                  right: -30,
                  background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
                  color: 'white', 
                  p: 2.5,
                  borderRadius: 5,
                  boxShadow: '0 15px 40px rgba(255, 107, 107, 0.4)',
                  animation: `${float} 4s ease-in-out infinite`,
                  border: '3px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 2
                }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AutoAwesomeIcon sx={{ fontSize: 24 }} />
                    <Typography variant="body1" fontWeight="900">
                      AI Powered
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- ÖZELLİKLER BÖLÜMÜ --- */}
      <Container maxWidth="xl" sx={{ mt: { xs: 4, md: 8 }, mb: { xs: 10, md: 12 }, position: 'relative', zIndex: 2 ,px: { xs: 2, md: 6, lg: 12 }}}>
        <Grid container spacing={4}>
          {[
            { 
              icon: <AutoAwesomeIcon fontSize="large" />, 
              title: "Yapay Zeka Gücü", 
              desc: "GPT-4 tabanlı analiz ile projenize özel, ikna edici metinler oluşturun.",
              color: '#667eea',
              gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            { 
              icon: <BoltIcon fontSize="large" />, 
              title: "Lightning Speed", 
              desc: "Saatlerce teklif yazmak yerine, dakikalar içinde profesyonel sonuç alın.",
              color: '#ff6b6b',
              gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)'
            },
            { 
              icon: <DescriptionIcon fontSize="large" />, 
              title: "Pro Format", 
              desc: "Otomatik formatlama, iş kalemleri tablosu ve kurumsal görünüm.",
              color: '#4ecdc4',
              gradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)'
            },
            { 
              icon: <SecurityIcon fontSize="large" />, 
              title: "Güvenli & Özel", 
              desc: "Verileriniz şifrelenir, gizliliğiniz korunur. GDPR uyumlu altyapı.",
              color: '#45b7d1',
              gradient: 'linear-gradient(135deg, #45b7d1 0%, #2196f3 100%)'
            }
          ].map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
              
              {/* 2. ve 3. ÖZELLİK: SCROLL REVEAL ve 3D HOVER (FRAMER MOTION İLE - HATA VERMEZ) */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  rotateX: 5,
                  rotateY: 5,
                  transition: { type: "spring", stiffness: 300 }
                }}
                style={{ height: '100%', transformStyle: "preserve-3d" }}
              >
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4.5, 
                    height: '100%',
                    borderRadius: 7,
                    background: `linear-gradient(135deg, ${alpha(item.color, 0.05)} 0%, rgba(255,255,255,0.02) 100%)`,
                    border: `2px solid ${alpha(item.color, 0.15)}`,
                    backdropFilter: 'blur(20px)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '5px',
                      background: item.gradient,
                      borderRadius: '7px 7px 0 0'
                    }
                  }}
                >
                  <Box sx={{ 
                    background: item.gradient,
                    width: 72,
                    height: 72,
                    borderRadius: 5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    color: 'white',
                    boxShadow: `0 10px 30px ${alpha(item.color, 0.35)}`
                  }}>
                    {item.icon}
                  </Box>
                  
                  <Typography variant="h6" fontWeight="800" gutterBottom sx={{ color: 'white', mb: 2 }}>
                    {item.title}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                    {item.desc}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* --- SÜREÇ BÖLÜMÜ --- */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
        backdropFilter: 'blur(20px)',
        py: { xs: 8, md: 12 },
        position: 'relative',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Box textAlign="center" mb={10}>
            <Chip 
              label="SÜREÇ"
              sx={{ 
                mb: 3,
                bgcolor: 'rgba(255,255,255,0.1)',
                color: '#ffd54f',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: 3,
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)'
              }}
            />
            <Typography variant="h2" fontWeight="900" sx={{ 
              color: 'white',
              mb: 3,
              fontSize: { xs: '3rem', md: '4.5rem' },
              background: 'linear-gradient(135deg, #ffffff, #e8eaf6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
            }}>
              3 Adımda Başarı
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: '650px', mx: 'auto', lineHeight: 1.8 }}>
              Karmaşık süreçleri geride bırakın. Akıllı sistemimiz her adımda yanınızda.
            </Typography>
          </Box>

          <Grid container spacing={8}>
            {[
              { 
                step: "01",
                title: "Bilgileri Gir", 
                desc: "Müşteri adı, proje detayları ve tercihlerinizi girin. AI asistanımız size rehberlik eder.",
                // 4. ÖZELLİK: HAREKETLİ İKON YERİNE FRAMER MOTION İLE CANLANAN MUI İKONLARI (HATASIZ)
                icon: <DescriptionIcon sx={{ fontSize: 50 }} />,
                color: '#667eea',
                gradient: 'linear-gradient(135deg, #667eea, #764ba2)'
              },
              { 
                step: "02",
                title: "AI Analiz Etsin", 
                desc: "Yapay zekamız sektörel standartlara uygun, ikna edici içerik ve fiyatlandırma üretir.",
                icon: <AutoAwesomeIcon sx={{ fontSize: 50 }} />,
                color: '#ff6b6b',
                gradient: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)'
              },
              { 
                step: "03",
                title: "İndir ve Kazanmaya Başla", 
                desc: "Profesyonel PDF formatında teklifiniz hazır. Müşterilerinizi etkilemeye başlayın.",
                icon: <TrendingUpIcon sx={{ fontSize: 50 }} />,
                color: '#4ecdc4',
                gradient: 'linear-gradient(135deg, #4ecdc4, #44a08d)'
              }
            ].map((item, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                {/* SCROLL REVEAL EKLEMESİ */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Box sx={{ 
                    position: 'relative',
                    textAlign: 'center'
                  }}>
                    
                    <Typography variant="h1" sx={{ 
                      fontSize: '8rem',
                      fontWeight: 900,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      lineHeight: 0.8,
                      mb: -6,
                      position: 'relative',
                      zIndex: 0
                    }}>
                      {item.step}
                    </Typography>
                    
                    {/* CANLI İKON EFEKTİ (HOVER YAPINCA OYNAR) */}
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      style={{ display: 'inline-block' }}
                    >
                      <Box sx={{
                        width: 110,
                        height: 110,
                        borderRadius: '30px',
                        background: item.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        mb: 4,
                        color: 'white',
                        boxShadow: `0 20px 50px ${alpha(item.color, 0.5)}`,
                        position: 'relative',
                        zIndex: 1,
                        border: '4px solid rgba(255,255,255,0.15)',
                        transition: 'all 0.4s ease',
                      }}>
                        {item.icon}
                      </Box>
                    </motion.div>
                    
                    <Typography variant="h4" fontWeight="900" sx={{ color: 'white', mb: 2 }}>
                      {item.title}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ 
                      color: 'rgba(255,255,255,0.75)', 
                      lineHeight: 1.8,
                      px: 2,
                      fontSize: '1.05rem'
                    }}>
                      {item.desc}
                    </Typography>

                    {index < 2 && (
                      <Box sx={{
                        display: { xs: 'none', md: 'block' },
                        position: 'absolute',
                        top: '30%',
                        right: '-50%',
                        width: '100px',
                        height: '3px',
                        background: `linear-gradient(90deg, ${item.color}60, transparent)`,
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          right: -8,
                          top: -4,
                          width: 0,
                          height: 0,
                          borderLeft: `8px solid ${item.color}60`,
                          borderTop: '5px solid transparent',
                          borderBottom: '5px solid transparent'
                        }
                      }} />
                    )}
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* --- TESTIMONIALS --- */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box textAlign="center" mb={10}>
          <Chip 
            label="REFERANSLAR"
            sx={{ 
              mb: 3,
              bgcolor: 'rgba(255,255,255,0.1)',
              color: '#ffd54f',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: 3,
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)'
            }}
          />
          <Typography variant="h2" fontWeight="900" sx={{ 
            color: 'white',
            mb: 3,
            fontSize: { xs: '3rem', md: '4rem' }
          }}>
            Binlerce Profesyonel Güveniyor
          </Typography>
          <Typography variant="h6" color="rgba(255,255,255,0.7)">
            Gerçek kullanıcılarımızdan gelen geri bildirimler
          </Typography>
        </Box>

        <Grid container spacing={5}>
          {[
            {
              name: "Ahmet Yılmaz",
              role: "Freelance Developer",
              avatar: "AY",
              rating: 5,
              text: "DotProposal sayesinde teklif hazırlama süremin %90'ını kısalttım. Artık daha çok projeye odaklanabiliyorum.",
              color: '#667eea',
              gradient: 'linear-gradient(135deg, #667eea, #764ba2)'
            },
            {
              name: "Elif Demir", 
              role: "UX Designer",
              avatar: "ED",
              rating: 5,
              text: "Müşterilerim artık tekliflerimi daha profesyonel buluyor. Kazanma oranım kesinlikle arttı!",
              color: '#ff6b6b',
              gradient: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)'
            },
            {
              name: "Can Öztürk",
              role: "Digital Marketer", 
              avatar: "CÖ",
              rating: 5,
              text: "AI'nin önerdiği fiyatlandırma stratejileri gerçekten işe yarıyor. Hem zaman hem de gelir artışı.",
              color: '#4ecdc4',
              gradient: 'linear-gradient(135deg, #4ecdc4, #44a08d)'
            }
          ].map((testimonial, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              {/* SCROLL REVEAL ve 3D EFFECT */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -10 }}
                style={{ height: '100%' }}
              >
                <Paper sx={{
                  p: 5,
                  height: '100%',
                  borderRadius: 7,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  backdropFilter: 'blur(30px)',
                  border: `2px solid ${alpha(testimonial.color, 0.2)}`,
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: testimonial.gradient
                  },
                  '&:hover': {
                    background: `linear-gradient(135deg, ${alpha(testimonial.color, 0.1)} 0%, rgba(255,255,255,0.03) 100%)`,
                    boxShadow: `0 25px 60px ${alpha(testimonial.color, 0.3)}`,
                    border: `2px solid ${alpha(testimonial.color, 0.4)}`
                  }
                }}>
                  <Stack direction="row" spacing={2.5} mb={3}>
                    <Avatar sx={{ 
                      background: testimonial.gradient,
                      width: 60,
                      height: 60,
                      fontWeight: 900,
                      fontSize: '1.3rem',
                      boxShadow: `0 8px 25px ${alpha(testimonial.color, 0.4)}`
                    }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="800" color="white">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.6)" fontWeight={600}>
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" mb={3}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} sx={{ color: '#ffd54f', fontSize: 24 }} />
                    ))}
                  </Stack>

                  <Typography variant="body1" sx={{ 
                    color: 'rgba(255,255,255,0.85)',
                    fontStyle: 'italic',
                    lineHeight: 1.8,
                    fontSize: '1.05rem'
                  }}>
                    "{testimonial.text}"
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* --- FINAL CTA --- */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
        backdropFilter: 'blur(30px)',
        py: { xs: 8, md: 10 },
        border: '2px solid rgba(255,255,255,0.1)',
        borderRadius: '80px 80px 0 0',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
          backgroundSize: '200% 100%',
          animation: `${shimmer} 3s linear infinite`
        }
      }}>
        {/* CTA Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative' }}>
            
            {/* Animated Icon */}
            <Box sx={{ 
              width: 100,
              height: 100,
              borderRadius: '30px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 5,
              boxShadow: '0 20px 60px rgba(102, 126, 234, 0.5)',
              animation: `${pulse} 3s ease-in-out infinite`,
              border: '4px solid rgba(255,255,255,0.2)'
            }}>
              <RocketLaunchIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>

            <Typography variant="h2" fontWeight="900" sx={{ 
              color: 'white',
              mb: 4,
              fontSize: { xs: '3rem', md: '4.5rem' },
              lineHeight: 1.2
            }}>
              Başarı Hikayeniz
              <br />
              <Box component="span" sx={{
                background: 'linear-gradient(135deg, #ffd54f, #ff8a65)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                Burada Başlıyor
              </Box>
            </Typography>
            
            <Typography variant="h6" sx={{ 
              color: 'rgba(255,255,255,0.8)',
              mb: 6,
              maxWidth: '550px',
              mx: 'auto',
              lineHeight: 1.8,
              fontSize: '1.2rem'
            }}>
              İlk teklifinizi ücretsiz oluşturun. Kredi kartı gerekmez, 
              anında başlayabilirsiniz. <strong style={{ color: '#ffd54f' }}>Farkı hemen görün.</strong>
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} justifyContent="center" mb={7}>
              <Button 
                variant="contained"
                size="large"
                onClick={() => navigate('/wizard')}
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  px: 8, 
                  py: 3,
                  fontSize: '1.3rem',
                  fontWeight: 900,
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #ffd54f, #ff8a65)',
                  color: 'white',
                  boxShadow: '0 20px 50px rgba(255, 213, 79, 0.5)',
                  border: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transition: 'left 0.6s'
                  },
                  '&:hover': {
                    transform: 'translateY(-5px) scale(1.05)',
                    boxShadow: '0 25px 60px rgba(255, 213, 79, 0.7)',
                    background: 'linear-gradient(135deg, #ffcc02, #ff7043)',
                    '&::before': {
                      left: '100%'
                    }
                  }
                }}
              >
                Ücretsiz Başla
              </Button>
              
              <Button 
                variant="outlined"
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{ 
                  px: 7, 
                  py: 3,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  borderRadius: '50px',
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderWidth: '2px',
                  backdropFilter: 'blur(10px)',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.7)',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 15px 40px rgba(255,255,255,0.2)',
                    borderWidth: '2px'
                  }
                }}
              >
                Örnekleri Gör
              </Button>
            </Stack>

            {/* Premium Trust Indicators */}
            <Box sx={{
              p: 4,
              borderRadius: 6,
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                justifyContent="center" 
                spacing={5}
                divider={<Box sx={{ width: '2px', bgcolor: 'rgba(255,255,255,0.1)', display: { xs: 'none', sm: 'block' } }} />}
              >
                {[
                  { icon: "🔒", label: "256-bit SSL Şifreleme" },
                  { icon: "⚡", label: "99.9% Uptime Garantisi" }, 
                  { icon: "🇹🇷", label: "7/24 Türkçe Destek" }
                ].map((item, index) => (
                  <Stack key={index} direction="row" alignItems="center" spacing={1.5}>
                    <Typography fontSize="1.5rem">{item.icon}</Typography>
                    <Typography variant="body2" fontWeight={600} color="rgba(255,255,255,0.9)">
                      {item.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Container>
        </motion.div>
      </Box>
    </Box>
  );
};

export default HomePage;