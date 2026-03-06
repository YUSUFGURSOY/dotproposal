// src/App.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar, Divider, ThemeProvider, CssBaseline, ListItemIcon, ListItemText, alpha, Container, Grid, Stack, Link as MuiLink, Badge } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from './app/store';
import { logout } from './features/auth/authSlice';
import { toggleTheme } from './features/theme/themeSlice'; 
import { getTheme } from './theme/theme'; 
import { AnimatePresence, motion } from 'framer-motion';
import NotFoundPage from './pages/NotFoundPage';

import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';

import { SnackbarProvider } from 'notistack';

import Brightness4Icon from '@mui/icons-material/Brightness4'; 
import Brightness7Icon from '@mui/icons-material/Brightness7'; 
import MenuIcon from '@mui/icons-material/Menu'; 
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import HomeIcon from '@mui/icons-material/Home';
import CreateIcon from '@mui/icons-material/Create';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import axios from 'axios';

import logo from './pictures/logo.png'; 

import PageTransition from './components/PageTransition';
import HomePage from './pages/HomePage';
import WizardPage from './pages/WizardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import ProposalDetail from './pages/ProposalDetail';
import PublicProposalPage from './pages/PublicProposalPage'; // İçe aktar

// --- NAVBAR BİLEŞENİ ---
const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { mode } = useSelector((state: RootState) => state.theme); 
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { t, i18n } = useTranslation();

  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (!isAuthenticated) return;
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get('http://localhost:5001/api/proposals', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const count = response.data.filter((p: { clientFeedback?: string; isClientFeedbackRead?: boolean }) => p.clientFeedback && p.clientFeedback.trim() !== '' && p.isClientFeedbackRead === false).length;
        setUnreadCount(count);
      } catch (error) {
        console.error('Bildirimler çekilemedi:', error);
      }
    };
    
    fetchUnreadMessages();
  }, [isAuthenticated, location.pathname]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
  };
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => { setAnchorEl(event.currentTarget); };
  const handleMenuClose = () => { setAnchorEl(null); };
  
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => { setMobileMoreAnchorEl(event.currentTarget); };
  const handleMobileMenuClose = () => { setMobileMoreAnchorEl(null); };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    handleMobileMenuClose();
    navigate('/');
  };

  const premiumMenuProps = {
    elevation: 0,
    sx: {
      overflow: 'visible',
      filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.15))',
      mt: 1.5,
      borderRadius: 4,
      background: mode === 'dark' ? 'rgba(20, 20, 25, 0.75)' : 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${alpha('#808080', 0.15)}`,
      minWidth: '200px',
      '& .MuiMenuItem-root': {
        borderRadius: 2,
        mx: 1,
        my: 0.5,
        px: 2,
        py: 1,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        fontWeight: 500,
        '&:hover': {
          background: alpha('#667eea', 0.1),
          transform: 'translateX(5px)',
          color: '#667eea',
          '& .MuiListItemIcon-root': { color: '#667eea' }
        }
      },
      '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        top: 0,
        right: 14,
        width: 10,
        height: 10,
        bgcolor: mode === 'dark' ? 'rgba(20, 20, 25, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        transform: 'translateY(-50%) rotate(45deg)',
        zIndex: 0,
        borderLeft: `1px solid ${alpha('#808080', 0.15)}`,
        borderTop: `1px solid ${alpha('#808080', 0.15)}`,
      }
    }
  };

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={premiumMenuProps}
    >
      <MenuItem disabled sx={{ opacity: '1 !important', pointerEvents: 'none' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>Hoş Geldin,</Typography>
          <Typography variant="body1" fontWeight="700" color="text.primary">{user?.name}</Typography>
        </Box>
      </MenuItem>
      <Divider sx={{ my: 1, borderColor: alpha('#808080', 0.1) }} />
      <MenuItem component={Link} to="/dashboard" onClick={handleMenuClose} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
          {t('nav.dashboard')}
        </Box>
        {unreadCount > 0 && (
          <Box sx={{ bgcolor: '#ff4d4f', color: 'white', px: 1, py: 0.2, borderRadius: 10, fontSize: '0.7rem', fontWeight: 'bold' }}>
            {unreadCount} Yeni
          </Box>
        )}
      </MenuItem>
      <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
        <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
        {t('nav.profile')}
      </MenuItem>
      <MenuItem onClick={handleLogout} sx={{ color: '#ff4d4f !important', '&:hover': { background: `${alpha('#ff4d4f', 0.1)} !important`, color: '#ff4d4f !important' } }}>
        <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#ff4d4f !important' }} /></ListItemIcon>
        {t('nav.logout')}
      </MenuItem>
    </Menu>
  );

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
      PaperProps={premiumMenuProps}
    >
      <MenuItem component={Link} to="/" onClick={handleMobileMenuClose}>
        <ListItemIcon><HomeIcon fontSize="small" /></ListItemIcon>
        <ListItemText primary={t('nav.home')} />
      </MenuItem>

      <MenuItem onClick={() => { toggleLanguage(); handleMobileMenuClose(); }}>
        <ListItemIcon><LanguageIcon fontSize="small" /></ListItemIcon>
        <ListItemText primary={`Dil: ${i18n.language.toUpperCase()}`} />
      </MenuItem>

      <MenuItem onClick={() => { dispatch(toggleTheme()); handleMobileMenuClose(); }}>
        <ListItemIcon>{mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}</ListItemIcon>
        <ListItemText primary={mode === 'dark' ? "Light Mode" : "Dark Mode"} />
      </MenuItem>

      <Divider sx={{ my: 1, borderColor: alpha('#808080', 0.1) }} />

      {isAuthenticated ? (
        [
          <MenuItem key="wizard" component={Link} to="/wizard" onClick={handleMobileMenuClose}>
            <ListItemIcon><CreateIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={t('nav.createProposal')} />
          </MenuItem>,
          <MenuItem key="dashboard" component={Link} to="/dashboard" onClick={handleMobileMenuClose} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ListItemIcon>
                <Badge color="error" variant="dot" invisible={unreadCount === 0}>
                  <DashboardIcon fontSize="small" />
                </Badge>
              </ListItemIcon>
              <ListItemText primary={t('nav.dashboard')} />
            </Box>
            {unreadCount > 0 && (
              <Typography variant="caption" sx={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                {unreadCount} Yeni
              </Typography>
            )}
          </MenuItem>,
          <MenuItem key="profile" component={Link} to="/profile" onClick={handleMobileMenuClose}>
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={t('nav.profile')} />
          </MenuItem>,
          <MenuItem key="logout" onClick={handleLogout} sx={{ color: '#ff4d4f !important' }}>
            <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#ff4d4f !important' }} /></ListItemIcon>
            <ListItemText primary={t('nav.logout')} />
          </MenuItem>
        ]
      ) : (
        [
          <MenuItem key="login" component={Link} to="/login" onClick={handleMobileMenuClose}>
            <ListItemIcon><LoginIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={t('nav.login')} />
          </MenuItem>,
          <MenuItem key="register" component={Link} to="/register" onClick={handleMobileMenuClose}>
            <ListItemIcon><AppRegistrationIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={t('nav.register')} />
          </MenuItem>
        ]
      )}
    </Menu>
  );

  return (
    <AppBar 
      position="sticky"
      elevation={0}
      sx={{ 
        background: mode === 'dark' ? 'rgba(15, 12, 41, 0.6)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        top: 0,
        zIndex: 1100,
        transition: 'all 0.3s ease'
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 6, lg: 12 } }}>
        <Toolbar disableGutters sx={{ minHeight: '80px !important' }}>
          
          <Box component={Link} to="/" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', textDecoration: 'none', cursor: 'pointer' }}>
            <motion.div whileHover={{ scale: 1.05, rotate: -5 }} transition={{ type: "spring", stiffness: 400 }}>
              <img src={logo} alt="Logo" style={{ height: '44px', marginRight: '16px', filter: 'drop-shadow(0px 4px 8px rgba(102, 126, 234, 0.4))' }} />
            </motion.div>
            <Typography variant="h5" sx={{ 
              fontWeight: 900, 
              letterSpacing: '-0.5px',
              background: mode === 'dark' ? 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)' : 'linear-gradient(135deg, #1a1a2e 0%, #667eea 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
              DotProposal
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
            
            <Button onClick={toggleLanguage} color="inherit" startIcon={<LanguageIcon />} 
              sx={{ 
                minWidth: 'auto', px: 1.5, py: 1, borderRadius: 3, fontWeight: 600,
                color: mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                '&:hover': { bgcolor: alpha('#667eea', 0.1), color: '#667eea' }
              }}>
              {i18n.language.toUpperCase()}
            </Button>

            <motion.div whileHover={{ rotate: 45 }} whileTap={{ scale: 0.9 }}>
              <IconButton onClick={() => dispatch(toggleTheme())} 
                sx={{ 
                  color: mode === 'dark' ? '#ffd54f' : '#764ba2',
                  bgcolor: mode === 'dark' ? 'rgba(255,213,79,0.1)' : 'rgba(118,75,162,0.1)',
                  '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255,213,79,0.2)' : 'rgba(118,75,162,0.2)' }
                }}>
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </motion.div>

            <Button component={Link} to="/" color="inherit" 
              sx={{ 
                fontWeight: 600, textTransform: 'none', fontSize: '1rem',
                color: mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                position: 'relative',
                '&::after': { content: '""', position: 'absolute', bottom: 4, left: '10%', width: '80%', height: '3px', borderRadius: 2, background: 'linear-gradient(90deg, #667eea, #764ba2)', transform: 'scaleX(0)', transition: 'transform 0.3s ease', transformOrigin: 'center' },
                '&:hover::after': { transform: 'scaleX(1)' },
                '&:hover': { bgcolor: 'transparent', color: mode === 'dark' ? '#fff' : '#000' }
              }}>
              {t('nav.home')}
            </Button>
            
            {isAuthenticated ? (
              <>
                <Button component={Link} to="/wizard" color="inherit"
                  sx={{ 
                    fontWeight: 600, textTransform: 'none', fontSize: '1rem',
                    color: mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                    position: 'relative',
                    '&::after': { content: '""', position: 'absolute', bottom: 4, left: '10%', width: '80%', height: '3px', borderRadius: 2, background: 'linear-gradient(90deg, #667eea, #764ba2)', transform: 'scaleX(0)', transition: 'transform 0.3s ease', transformOrigin: 'center' },
                    '&:hover::after': { transform: 'scaleX(1)' },
                    '&:hover': { bgcolor: 'transparent', color: mode === 'dark' ? '#fff' : '#000' }
                  }}>
                  {t('nav.createProposal')}
                </Button>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <IconButton size="small" onClick={handleProfileMenuOpen} sx={{ ml: 1, p: 0.5 }}>
                    <Badge color="error" overlap="circular" badgeContent={unreadCount} invisible={unreadCount === 0}>
                      <Box sx={{ 
                        p: '3px', borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                      }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: mode === 'dark' ? '#1a1a2e' : '#fff', color: mode === 'dark' ? '#fff' : '#1a1a2e', fontSize: '1rem', fontWeight: 800 }}>
                          {user?.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </Box>
                    </Badge>
                  </IconButton>
                </motion.div>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" color="inherit" 
                  sx={{ 
                    fontWeight: 600, textTransform: 'none', fontSize: '1rem', mx: 1,
                    color: mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                    '&:hover': { color: '#667eea', bgcolor: 'transparent' }
                  }}>
                  {t('nav.login')}
                </Button>
                
                <Button component={Link} to="/register" variant="contained"
                  sx={{ 
                    ml: 1, px: 3.5, py: 1, fontSize: '0.95rem', fontWeight: 800,
                    borderRadius: '50px', textTransform: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.6)',
                      background: 'linear-gradient(135deg, #5568d3 0%, #6941a6 100%)',
                    }
                  }}>
                  {t('nav.register')}
                </Button>
              </>
            )}
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
            <motion.div whileHover={{ rotate: 45 }} whileTap={{ scale: 0.9 }}>
              <IconButton onClick={() => dispatch(toggleTheme())} size="small"
                sx={{ 
                  color: mode === 'dark' ? '#ffd54f' : '#764ba2',
                  bgcolor: mode === 'dark' ? 'rgba(255,213,79,0.1)' : 'rgba(118,75,162,0.1)',
                }}>
                {mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
              </IconButton>
            </motion.div>

            <IconButton
              size="large"
              aria-label="show more"
              aria-controls="primary-search-account-menu-mobile"
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              sx={{
                color: mode === 'dark' ? '#fff' : '#000',
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                borderRadius: 3,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: alpha('#667eea', 0.2), color: '#667eea' }
              }}
            >
              <Badge color="error" variant="dot" invisible={unreadCount === 0}>
                <MenuIcon />
              </Badge>
            </IconButton>
          </Box>

        </Toolbar>
      </Container>
      {renderMobileMenu}
      {renderMenu}
    </AppBar>
  );
}

// --- ANİMASYONLU ROUTER ---
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
        <Route path="/wizard" element={<PageTransition><WizardPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
        <Route path="/proposal/:id" element={<PageTransition><ProposalDetail /></PageTransition>} />
        <Route path="/*" element={<PageTransition><NotFoundPage /></PageTransition>} />
        <Route path="/view/:id" element={<PublicProposalPage />} />
      </Routes>
    </AnimatePresence>
  );
};

// --- YENİ EKLENEN: PREMIUM FOOTER BİLEŞENİ ---
const Footer: React.FC = () => {
  const { mode } = useSelector((state: RootState) => state.theme);
  const isDark = mode === 'dark';
  const currentYear = new Date().getFullYear();

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const linkHoverSx = {
    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    fontSize: '0.95rem',
    '&:hover': {
      color: '#667eea',
      transform: 'translateX(5px)'
    }
  };

  const socialIconSx = {
    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
    transition: 'all 0.3s ease',
    '&:hover': {
      color: '#ffffff',
      bgcolor: '#667eea',
      transform: 'translateY(-3px)'
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: isDark ? '#050508' : '#f8f9fa',
        pt: { xs: 8, md: 10 },
        pb: 4,
        position: 'relative',
        overflow: 'hidden',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)'
      }} />

      <Box sx={{
        position: 'absolute',
        bottom: '-20%',
        left: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 6, lg: 12 }, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 8 }}>
          
          <Grid size={{ xs: 12, md: 4, lg: 4 }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}>
              <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', mb: 3 }}>
                <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '16px' }} />
                <Typography variant="h5" sx={{ 
                  fontWeight: 900, 
                  background: isDark ? 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)' : 'linear-gradient(135deg, #1a1a2e 0%, #667eea 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}>
                  DotProposal
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', mb: 4, lineHeight: 1.8, pr: { md: 4 } }}>
                Yapay zeka gücüyle profesyonel teklifleri saniyeler içinde oluşturun. Zaman kazanın, işinizi büyütün ve müşterilerinizi etkileyin.
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <IconButton aria-label="Twitter" sx={socialIconSx}><TwitterIcon /></IconButton>
                <IconButton aria-label="LinkedIn" sx={socialIconSx}><LinkedInIcon /></IconButton>
                <IconButton aria-label="GitHub" sx={socialIconSx}><GitHubIcon /></IconButton>
              </Stack>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 6, sm: 6, md: 2, lg: 2 }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants} transition={{ delay: 0.1 }}>
              <Typography variant="h6" fontWeight="700" sx={{ color: isDark ? '#fff' : '#000', mb: 3 }}>
                Ürün
              </Typography>
              <Stack spacing={2.5}>
                <MuiLink component={Link} to="/wizard" sx={linkHoverSx}>
                  <AutoAwesomeIcon sx={{ fontSize: 16, color: '#ffd54f' }} /> Özellikler
                </MuiLink>
                <MuiLink component={Link} to="/" sx={linkHoverSx}>Fiyatlandırma</MuiLink>
                <MuiLink component={Link} to="/" sx={linkHoverSx}>Örnek Teklifler</MuiLink>
                <MuiLink component={Link} to="/" sx={linkHoverSx}>Yenilikler</MuiLink>
              </Stack>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants} transition={{ delay: 0.2 }}>
              <Typography variant="h6" fontWeight="700" sx={{ color: isDark ? '#fff' : '#000', mb: 3 }}>
                Kaynaklar
              </Typography>
              <Stack spacing={2.5}>
                <MuiLink component={Link} to="/" sx={linkHoverSx}>Blog</MuiLink>
                <MuiLink component={Link} to="/" sx={linkHoverSx}>Yardım Merkezi</MuiLink>
                <MuiLink component={Link} to="/" sx={linkHoverSx}>İletişim</MuiLink>
                <MuiLink component={Link} to="/" sx={linkHoverSx}>Sistem Durumu</MuiLink>
              </Stack>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, md: 3, lg: 3 }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants} transition={{ delay: 0.3 }}>
              <Typography variant="h6" fontWeight="700" sx={{ color: isDark ? '#fff' : '#000', mb: 3 }}>
                Yasal
              </Typography>
              <Stack spacing={2.5}>
                <MuiLink component={Link} to="/" sx={linkHoverSx}>Kullanım Koşulları</MuiLink>
                <MuiLink component={Link} to="/" sx={linkHoverSx}>Gizlilik Politikası</MuiLink>
                <MuiLink component={Link} to="/" sx={linkHoverSx}>KVKK Aydınlatma Metni</MuiLink>
              </Stack>
              
              <Box sx={{ 
                mt: 4, p: 2.5, borderRadius: 3, 
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                transition: 'all 0.3s ease',
                '&:hover': { borderColor: alpha('#667eea', 0.3), bgcolor: alpha('#667eea', 0.05) }
              }}>
                <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 500 }}>
                  <EmailIcon fontSize="small" sx={{ color: '#667eea' }} />
                  destek@dotproposal.com
                </Typography>
              </Box>
            </motion.div>
          </Grid>

        </Grid>

        <Divider sx={{ mt: { xs: 4, md: 8 }, mb: 4, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            © {currentYear} DotProposal. Tüm hakları saklıdır.
          </Typography>

          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center' }}>
            Designed with <span style={{ color: '#ff4d4f', margin: '0 4px' }}>♥</span> in Turkey
          </Typography>
        </Box>

      </Container>
    </Box>
  );
};

// --- ANA APP ---
function App() {
  const { mode } = useSelector((state: RootState) => state.theme);
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <SnackbarProvider 
        maxSnack={3} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={3000}
      >
        <BrowserRouter>
          {/* İçeriklerin üst ve alt kısmı esneyecek şekilde ayarlandı */}
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <AnimatedRoutes />
            </Box>
            {/* YENİ EKLENEN FOOTER */}
            <Footer />
          </Box>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;