// src/App.tsx
import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar, Divider, ThemeProvider, CssBaseline } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from './app/store';
import { logout } from './features/auth/authSlice';
import { toggleTheme } from './features/theme/themeSlice'; 
import { getTheme } from './theme/theme'; 
import { AnimatePresence } from 'framer-motion';
import NotFoundPage from './pages/NotFoundPage';


// --- YENİ: i18n Importları ---
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';
// ----------------------------
import { SnackbarProvider } from 'notistack';
// İkonlar ve Resimler
import Brightness4Icon from '@mui/icons-material/Brightness4'; 
import Brightness7Icon from '@mui/icons-material/Brightness7'; 
import logo from './pictures/logo.png'; 

// Sayfalar ve Bileşenler
import PageTransition from './components/PageTransition';
import HomePage from './pages/HomePage';
import WizardPage from './pages/WizardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';

// 👇 EKSİK OLAN IMPORT EKLENDİ
import ProposalDetail from './pages/ProposalDetail';


// --- NAVBAR BİLEŞENİ ---
const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { mode } = useSelector((state: RootState) => state.theme); 
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // --- YENİ: Dil Hook'u ---
  const { t, i18n } = useTranslation();

  // Dil Değiştirme Fonksiyonu
  const toggleLanguage = () => {
    const newLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
  };
  // ------------------------
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => { setAnchorEl(event.currentTarget); };
  const handleClose = () => { setAnchorEl(null); };
  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/');
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          {/* Logo Alanı */}
          <Box component={Link} to="/" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', textDecoration: 'none', cursor: 'pointer' }}>
            <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '12px' }} />
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold', letterSpacing: 0.5 }}>
              DotProposal
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {/* DİL DEĞİŞTİRME BUTONU */}
            <Button 
              onClick={toggleLanguage} 
              color="inherit" 
              startIcon={<LanguageIcon />}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              {i18n.language.toUpperCase()}
            </Button>

            {/* TEMA DEĞİŞTİRME BUTONU */}
            <IconButton onClick={() => dispatch(toggleTheme())} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            {/* MENÜ LİNKLERİ (Artık t() fonksiyonu ile çevriliyor) */}
            <Button component={Link} to="/" color="inherit">{t('nav.home')}</Button>
            
            {isAuthenticated ? (
              <>
                 <Button component={Link} to="/wizard" color="inherit">{t('nav.createProposal')}</Button>
                 
                 <IconButton size="large" onClick={handleMenu} color="inherit" sx={{ ml: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 16 }}>
                      {user?.name.charAt(0)}
                    </Avatar>
                 </IconButton>

                 <Menu
                    anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
                    PaperProps={{ elevation: 0, sx: { overflow: 'visible', filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))', mt: 1.5 }}}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                 >
                    <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 'bold', color: 'text.primary' }}>{user?.name}</MenuItem>
                    <Divider />
                    <MenuItem component={Link} to="/dashboard" onClick={handleClose}>{t('nav.dashboard')}</MenuItem>
                    <MenuItem component={Link} to="/profile" onClick={handleClose}>{t('nav.profile')}</MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>{t('nav.logout')}</MenuItem>
                 </Menu>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" color="inherit">{t('nav.login')}</Button>
                <Button component={Link} to="/register" variant="contained" color="primary" sx={{ ml: 2 }}>{t('nav.register')}</Button>
              </>
            )}
          </Box>
        </Toolbar>
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
        
        {/* 👇 EKSİK OLAN ROTA EKLENDİ */}
        <Route path="/proposal/:id" element={<PageTransition><ProposalDetail /></PageTransition>} />
        
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
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
          <Navbar />
          <AnimatedRoutes />
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;