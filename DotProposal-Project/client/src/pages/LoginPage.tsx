// src/pages/LoginPage.tsx
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
import { useDispatch, useSelector } from 'react-redux';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { loginUser, reset } from '../features/auth/authSlice';
import type { AppDispatch, RootState } from '../app/store';
import { keyframes, alpha } from '@mui/system';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  // 🔹 Animations
  const float = keyframes`
    0% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
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
      dispatch(reset());
    }
    if (isSuccess) {
      enqueueSnackbar(t('auth.loginSuccess', 'Giriş Başarılı!'), {
        variant: 'success',
      });
      navigate('/dashboard');
      dispatch(reset());
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

  // 🔹 Gradient Arka Plan
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
          width: 300,
          height: 300,
          borderRadius: '50%',
          top: '-80px',
          left: '-80px',
          background: 'rgba(255, 255, 255, 0.08)',
          filter: 'blur(60px)',
          animation: `${float} 6s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          bottom: '-60px',
          right: '-60px',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(40px)',
          animation: `${float} 5s ease-in-out infinite reverse`,
        }}
      />

      <Container maxWidth="xs">
        <Paper
          elevation={8}
          sx={{
            p: 5,
            borderRadius: 5,
            background: alpha('#fff', 0.12),
            backdropFilter: 'blur(20px)',
            boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
            color: 'white',
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: '50%',
                bgcolor: alpha('#ffffff', 0.15),
                animation: `${pulse} 3s ease-in-out infinite`,
              }}
            >
              <LockOpenIcon sx={{ fontSize: 38, color: '#fff' }} />
            </Box>

            <Typography
              component="h1"
              variant="h4"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(45deg,#fff,#e3f2fd)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {t('nav.login', 'Giriş Yap')}
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}
            >
              Hoş geldin! Devam etmek için hesabına giriş yap 🚀
            </Typography>
          </Stack>

          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{ mt: 4, width: '100%' }}
          >
            <TextField
              margin="normal"
              fullWidth
              required
              label={t('auth.email', 'E-posta Adresi')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              InputProps={{
                sx: { color: '#fff' },
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255,255,255,0.7)' },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: '#fff' },
                  '&.Mui-focused fieldset': {
                    borderColor: '#fff',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              required
              label={t('auth.password', 'Şifre')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                sx: { color: '#fff' },
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255,255,255,0.7)' },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: '#fff' },
                  '&.Mui-focused fieldset': {
                    borderColor: '#fff',
                  },
                },
              }}
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
                t('nav.login', 'Giriş Yap')
              )}
            </Button>

            <Box display="flex" justifyContent="space-between" mt={3}>
              <MuiLink
                component={Link}
                to="/register"
                variant="body2"
                sx={{ color: '#90caf9', textDecoration: 'none' }}
              >
                {t('auth.noAccount', 'Hesabın yok mu? Kayıt ol')}
              </MuiLink>

              <MuiLink
                component={Link}
    to="/forgot-password"
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
              >
                {t('auth.forgotPassword', 'Şifremi Unuttum')}
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
