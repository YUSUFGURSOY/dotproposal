// src/pages/RegisterPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link as MuiLink,
  CircularProgress,
  Stack,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { registerUser, reset } from '../features/auth/authSlice';
import type { AppDispatch, RootState } from '../app/store';
import { useSnackbar } from 'notistack';
import { keyframes, alpha } from '@mui/system';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const { name, email, password, passwordConfirm } = formData;

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  // 🔹 Animations
  const float = keyframes`
    0% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0); }
  `;

  const pulse = keyframes`
    0% { box-shadow: 0 0 10px rgba(255,255,255,0.2); }
    50% { box-shadow: 0 0 25px rgba(255,255,255,0.4); }
    100% { box-shadow: 0 0 10px rgba(255,255,255,0.2); }
  `;

  useEffect(() => {
    if (isError) {
      enqueueSnackbar(message, { variant: 'error' });
    }
    if (isSuccess) {
      enqueueSnackbar(
        t('auth.registerSuccess', 'Kayıt başarılı! Yönlendiriliyorsunuz...'),
        { variant: 'success' }
      );
      navigate('/wizard');
    }
    dispatch(reset());
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
      enqueueSnackbar(t('auth.passwordMismatch', 'Şifreler eşleşmiyor!'), {
        variant: 'warning',
      });
      return;
    }
    const userData = { name, email, password };
    dispatch(registerUser(userData));
  };

  const gradientBg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  return (
    <Box
      sx={{
        background: gradientBg,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* --- Dekoratif daireler --- */}
      <Box
        sx={{
          position: 'absolute',
          width: 350,
          height: 350,
          borderRadius: '50%',
          top: '-100px',
          right: '-100px',
          background: 'rgba(255, 255, 255, 0.08)',
          filter: 'blur(70px)',
          animation: `${float} 7s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 250,
          height: 250,
          borderRadius: '50%',
          bottom: '-80px',
          left: '-80px',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(50px)',
          animation: `${float} 5s ease-in-out infinite reverse`,
        }}
      />

      <Container maxWidth="lg">
        <Paper
          elevation={12}
          sx={{
            borderRadius: 6,
            overflow: 'hidden',
            background: alpha('#fff', 0.12),
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            {/* --- SOL TARAF: BİLGİ ALANI --- */}
            <Box
              sx={{
                flex: { md: '0 0 40%' },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                p: 6,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                color: 'white',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 40,
                  right: 40,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  filter: 'blur(30px)',
                }}
              />

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    p: 2.5,
                    bgcolor: alpha('#fff', 0.15),
                    borderRadius: '50%',
                    width: 'fit-content',
                    mb: 3,
                    animation: `${pulse} 3s ease-in-out infinite`,
                  }}
                >
                  <AppRegistrationIcon sx={{ fontSize: 40 }} />
                </Box>

                <Typography variant="h3" fontWeight="900" mb={2}>
                  Aramıza Katıl
                </Typography>

                <Typography variant="body1" mb={4} sx={{ opacity: 0.9 }}>
                  DotProposal ile profesyonel teklifler hazırla, AI gücünden
                  yararlan ve işlerini kolaylaştır.
                </Typography>

                <Stack spacing={2}>
                  {[
                    'Yapay Zeka destekli analiz',
                    'Dakikalar içinde profesyonel teklif',
                    'Şık PDF çıktıları',
                    'Sınırsız teklif oluşturma',
                  ].map((item, index) => (
                    <Stack key={index} direction="row" spacing={1.5} alignItems="center">
                      <CheckCircleOutlineIcon sx={{ fontSize: 22 }} />
                      <Typography variant="body2">{item}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Box>

            {/* --- SAĞ TARAF: FORM ALANI --- */}
            <Box sx={{ flex: 1, p: 6, bgcolor: 'white' }}>
              <Stack alignItems="center" spacing={1} mb={4}>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                  {t('auth.createAccount', 'Hesap Oluştur')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ücretsiz hesap oluştur ve hemen başla 🚀
                </Typography>
              </Stack>

              <Box component="form" onSubmit={handleRegister}>
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
                  disabled={isLoading}
                  sx={{
                    mt: 4,
                    mb: 2,
                    py: 1.5,
                    fontWeight: 'bold',
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(45deg,#667eea,#764ba2)',
                    boxShadow: '0 10px 25px rgba(102,126,234,0.4)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 15px 35px rgba(102,126,234,0.6)',
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={26} color="inherit" />
                  ) : (
                    t('nav.register', 'Kayıt Ol')
                  )}
                </Button>

                <Box textAlign="center" mt={3}>
                  <MuiLink
                    component={Link}
                    to="/login"
                    variant="body2"
                    sx={{ color: '#667eea', textDecoration: 'none' }}
                  >
                    {t('auth.haveAccount', 'Zaten hesabın var mı? Giriş Yap')}
                  </MuiLink>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
