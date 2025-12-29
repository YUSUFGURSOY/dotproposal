// src/pages/RegisterPage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Link as MuiLink, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { registerUser, reset } from '../features/auth/authSlice';
import type { AppDispatch, RootState } from '../app/store';
import { useSnackbar } from 'notistack';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { enqueueSnackbar } = useSnackbar();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });

  const { name, email, password, passwordConfirm } = formData;

  // Redux State'ini Çek
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  // İşlem başarılıysa veya hata varsa ne olacak?
  useEffect(() => {
    if (isError) {
      enqueueSnackbar(message, { variant: 'error' });
    }

    if (isSuccess) {
      enqueueSnackbar(t('auth.registerSuccess', 'Kayıt başarılı! Yönlendiriliyorsunuz...'), { variant: 'success' });
      navigate('/wizard');
    }

    dispatch(reset()); // Sayfa açılınca veya işlem bitince state'i temizle
  }, [isError, isSuccess, message, navigate, dispatch, enqueueSnackbar, t]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      enqueueSnackbar(t('auth.passwordMismatch', 'Şifreler eşleşmiyor!'), { variant: 'warning' });
      return;
    }

    // Backend'e gönderilecek veriler
    const userData = { name, email, password };
    dispatch(registerUser(userData));
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ p: 2, bgcolor: 'secondary.main', borderRadius: '50%', mb: 2 }}>
           <AppRegistrationIcon sx={{ fontSize: 30, color: 'white' }} />
        </Box>
        
        <Typography component="h1" variant="h5" fontWeight="bold">
          {t('auth.createAccount', 'Hesap Oluştur')}
        </Typography>
        
        <Box component="form" onSubmit={handleRegister} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label={t('auth.fullName', 'Ad Soyad')}
            name="name"
            value={name}
            onChange={onChange}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label={t('auth.email', 'E-Posta Adresi')}
            name="email"
            type="email"
            value={email}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label={t('auth.password', 'Şifre')}
            name="password"
            type="password"
            value={password}
            onChange={onChange}
          />
           <TextField
            margin="normal"
            required
            fullWidth
            label={t('auth.passwordConfirm', 'Şifre Tekrar')}
            name="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={onChange}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : t('nav.register', 'Kayıt Ol')}
          </Button>

          <Box textAlign="center" mt={2}>
            <MuiLink component={Link} to="/login" variant="body2">
              {t('auth.haveAccount', 'Zaten hesabın var mı? Giriş Yap')}
            </MuiLink>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;