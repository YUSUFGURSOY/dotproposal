// src/pages/NotFoundPage.tsx
import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// Üzgün yüz ikonunu kaldırdık
import HomeIcon from '@mui/icons-material/Home';
import { useTranslation } from 'react-i18next';

// Kendi 404 görselinizi import ediyoruz
// Not: Uzantının doğru olduğundan emin olun (.png, .jpg vs.)
import notFoundImage from '../pictures/404_logo.jpg';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 4 }}>
        
        {/* Üzgün yüz ikonu yerine görseli ekliyoruz */}
        {/* MUI Box bileşenini 'img' etiketi olarak kullanmak stil vermeyi kolaylaştırır */}
        <Box
          component="img"
          src={notFoundImage}
          alt="404 Not Found"
          sx={{ 
            height: 150, // Görselin yüksekliği (isteğe göre ayarlayabilirsiniz)
            mb: 2,       // Alt boşluk
            maxWidth: '100%', // Mobilde taşmaması için
            objectFit: 'contain'
          }}
        />
        
        <Typography variant="h2" fontWeight="bold" color="primary" gutterBottom>
          404
        </Typography>
        
        <Typography variant="h5" gutterBottom>
          {t('notFound.title', 'Sayfa Bulunamadı')}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('notFound.desc', 'Aradığınız sayfa mevcut değil veya taşınmış olabilir.')}
        </Typography>

        <Box mt={3}>
          <Button 
            variant="contained" 
            size="large" 
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
          >
            {t('notFound.backHome', 'Ana Sayfaya Dön')}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFoundPage;