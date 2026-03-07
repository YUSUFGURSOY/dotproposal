// src/pages/VerifyEmailPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { keyframes, styled } from '@mui/system';
import { verifyUserEmail } from '../features/auth/authSlice';
// 👇 YENİ: store'dan AppDispatch'i çekiyoruz
import type { AppDispatch } from '../app/store';

// Mui Background gradient
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const PageWrapper = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
});

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  // 👇 FIX: any yerine uygulamanın kendi dispatch tipini (AppDispatch) kullandık
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  // React 18 strict mode'da iki kere çalışmayı engellemek için
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token || calledRef.current) return;
    calledRef.current = true;

    dispatch(verifyUserEmail(token))
      .unwrap()
      .then(() => {
        setStatus('success');
      })
      .catch((err: string) => {
        setStatus('error');
        setErrorMessage(err || 'Doğrulama işlemi başarısız oldu.');
      });
  }, [token, dispatch]);

  return (
    <PageWrapper>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 6, 
          borderRadius: 4, 
          textAlign: 'center', 
          maxWidth: 450, 
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          animation: `${fadeUp} 0.5s ease-out`
        }}
      >
        {status === 'loading' && (
          <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress size={60} sx={{ color: '#667eea', mb: 3 }} />
            <Typography variant="h5" fontWeight="700" color="text.primary" mb={1}>
              E-postanız Doğrulanıyor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lütfen bekleyin, bilgileriniz kontrol ediliyor...
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box display="flex" flexDirection="column" alignItems="center">
            <CheckCircleOutlineIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
            <Typography variant="h5" fontWeight="700" color="text.primary" mb={1}>
              Harika! Başarıyla Doğrulandı
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              E-posta adresiniz onaylandı. Artık DotProposal'ın yapay zeka özelliklerini sınırsızca kullanabilirsiniz.
            </Typography>
            <Button 
              variant="contained" 
              fullWidth
              size="large"
              onClick={() => navigate('/wizard')}
              sx={{ 
                borderRadius: '50px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Hemen Teklif Oluştur
            </Button>
          </Box>
        )}

        {status === 'error' && (
          <Box display="flex" flexDirection="column" alignItems="center">
            <ErrorOutlineIcon sx={{ fontSize: 80, color: '#f44336', mb: 2 }} />
            <Typography variant="h5" fontWeight="700" color="text.primary" mb={1}>
              Doğrulama Başarısız
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              {errorMessage} Linkin süresi dolmuş veya hatalı olabilir. Lütfen panonuzdan yeni bir doğrulama maili isteyin.
            </Typography>
            <Button 
              variant="outlined" 
              fullWidth
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ 
                borderRadius: '50px', 
                textTransform: 'none',
                fontWeight: 700,
                borderColor: '#667eea',
                color: '#667eea'
              }}
            >
              Dashboard'a Dön
            </Button>
          </Box>
        )}
      </Paper>
    </PageWrapper>
  );
};

export default VerifyEmailPage;