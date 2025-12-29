// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Link as MuiLink, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { loginUser, reset } from '../features/auth/authSlice';
import type { AppDispatch, RootState } from '../app/store';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  // Redux State
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // Hata varsa göster
    if (isError) {
      enqueueSnackbar(message, { variant: 'error' });
      dispatch(reset()); // Hatayı gösterdikten sonra durumu sıfırla
    }

    // Başarı varsa göster ve yönlendir
    if (isSuccess) {
      enqueueSnackbar(t('auth.loginSuccess', 'Giriş Başarılı!'), { variant: 'success' });
      navigate('/dashboard'); 
      dispatch(reset()); // Başarıyı gösterdikten sonra durumu sıfırla
    }

  }, [isError, isSuccess, message, navigate, dispatch, enqueueSnackbar, t]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      enqueueSnackbar(t('auth.fillAllFields'), { variant: 'warning' });
      return;
    }

    dispatch(loginUser({ email, password }));
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: '50%', mb: 2 }}>
           <LockOpenIcon sx={{ fontSize: 30, color: 'white' }} />
        </Box>
        
        <Typography component="h1" variant="h5" fontWeight="bold">
          {t('nav.login', 'Giriş Yap')}
        </Typography>
        
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label={t('auth.email', 'E-Posta Adresi')}
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label={t('auth.password', 'Şifre')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : t('nav.login', 'Giriş Yap')}
          </Button>

          <Box display="flex" justifyContent="space-between" mt={2}>
            <MuiLink component={Link} to="/register" variant="body2">
              {t('auth.noAccount', 'Hesabın yok mu? Kayıt Ol')}
            </MuiLink>
            <MuiLink href="#" variant="body2">
              {t('auth.forgotPassword', 'Şifremi Unuttum')}
            </MuiLink>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;