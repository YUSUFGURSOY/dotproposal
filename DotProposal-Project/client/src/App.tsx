// src/App.tsx
import React, { useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar, Divider, ThemeProvider, CssBaseline, ListItemIcon, ListItemText } from '@mui/material';
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
import MenuIcon from '@mui/icons-material/Menu'; // <-- Hamburger Menü İkonu
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import HomeIcon from '@mui/icons-material/Home';
import CreateIcon from '@mui/icons-material/Create';

import logo from './pictures/logo.png'; 

// Sayfalar ve Bileşenler
import PageTransition from './components/PageTransition';
import HomePage from './pages/HomePage';
import WizardPage from './pages/WizardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import ProposalDetail from './pages/ProposalDetail';

// --- NAVBAR BİLEŞENİ ---
const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { mode } = useSelector((state: RootState) => state.theme); 
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
  };
  
  // Desktop User Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Mobile Menu State
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  // Desktop Menu Handlers
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => { setAnchorEl(event.currentTarget); };
  const handleMenuClose = () => { setAnchorEl(null); };
  
  // Mobile Menu Handlers
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => { setMobileMoreAnchorEl(event.currentTarget); };
  const handleMobileMenuClose = () => { setMobileMoreAnchorEl(null); };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    handleMobileMenuClose();
    navigate('/');
  };

  // --- MASAÜSTÜ MENÜSÜ (User Dropdown) ---
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{ elevation: 0, sx: { overflow: 'visible', filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))', mt: 1.5 }}}
    >
      <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 'bold', color: 'text.primary' }}>{user?.name}</MenuItem>
      <Divider />
      <MenuItem component={Link} to="/dashboard" onClick={handleMenuClose}>
        <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
        {t('nav.dashboard')}
      </MenuItem>
      <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
        <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
        {t('nav.profile')}
      </MenuItem>
      <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
        <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
        {t('nav.logout')}
      </MenuItem>
    </Menu>
  );

  // --- MOBİL MENÜSÜ (Hamburger İçeriği) ---
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      {/* Ortak Linkler */}
      <MenuItem component={Link} to="/" onClick={handleMobileMenuClose}>
        <ListItemIcon><HomeIcon fontSize="small" /></ListItemIcon>
        <ListItemText primary={t('nav.home')} />
      </MenuItem>

      {/* Dil Değiştirme */}
      <MenuItem onClick={() => { toggleLanguage(); handleMobileMenuClose(); }}>
        <ListItemIcon><LanguageIcon fontSize="small" /></ListItemIcon>
        <ListItemText primary={`Dil: ${i18n.language.toUpperCase()}`} />
      </MenuItem>

      {/* Tema Değiştirme */}
      <MenuItem onClick={() => { dispatch(toggleTheme()); handleMobileMenuClose(); }}>
        <ListItemIcon>{mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}</ListItemIcon>
        <ListItemText primary={mode === 'dark' ? "Light Mode" : "Dark Mode"} />
      </MenuItem>

      <Divider />

      {isAuthenticated ? (
        // Giriş Yapmış Kullanıcı İçin Linkler
        [
          <MenuItem key="wizard" component={Link} to="/wizard" onClick={handleMobileMenuClose}>
            <ListItemIcon><CreateIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={t('nav.createProposal')} />
          </MenuItem>,
          <MenuItem key="dashboard" component={Link} to="/dashboard" onClick={handleMobileMenuClose}>
            <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={t('nav.dashboard')} />
          </MenuItem>,
          <MenuItem key="profile" component={Link} to="/profile" onClick={handleMobileMenuClose}>
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={t('nav.profile')} />
          </MenuItem>,
          <MenuItem key="logout" onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText primary={t('nav.logout')} />
          </MenuItem>
        ]
      ) : (
        // Giriş Yapmamış Kullanıcı İçin Linkler
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
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        {/* Logo Alanı */}
        <Box component={Link} to="/" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', textDecoration: 'none', cursor: 'pointer' }}>
          <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '12px' }} />
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold', letterSpacing: 0.5 }}>
            DotProposal
          </Typography>
        </Box>

        {/* --- MASAÜSTÜ GÖRÜNÜMÜ (md ve üzeri) --- */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          
          <Button onClick={toggleLanguage} color="inherit" startIcon={<LanguageIcon />} sx={{ minWidth: 'auto', px: 1 }}>
            {i18n.language.toUpperCase()}
          </Button>

          <IconButton onClick={() => dispatch(toggleTheme())} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          <Button component={Link} to="/" color="inherit">{t('nav.home')}</Button>
          
          {isAuthenticated ? (
            <>
               <Button component={Link} to="/wizard" color="inherit">{t('nav.createProposal')}</Button>
               <IconButton size="large" onClick={handleProfileMenuOpen} color="inherit" sx={{ ml: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 16 }}>
                    {user?.name.charAt(0)}
                  </Avatar>
               </IconButton>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" color="inherit">{t('nav.login')}</Button>
              <Button component={Link} to="/register" variant="contained" color="primary" sx={{ ml: 2 }}>{t('nav.register')}</Button>
            </>
          )}
        </Box>

        {/* --- MOBİL GÖRÜNÜMÜ (md altı) --- */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            aria-label="show more"
            aria-controls="primary-search-account-menu-mobile"
            aria-haspopup="true"
            onClick={handleMobileMenuOpen}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
        </Box>

      </Toolbar>
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