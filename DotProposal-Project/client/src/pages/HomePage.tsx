// src/pages/HomePage.tsx
import React from 'react';
import { Container, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useTranslation } from 'react-i18next'; // <--- YENİ EKLENDİ

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // <--- YENİ EKLENDİ

  return (
    <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
      <Paper elevation={3} sx={{ p: 6, borderRadius: 4 }}>
        <AutoFixHighIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          DotProposal
        </Typography>
        
        <Typography variant="h5" color="text.secondary" paragraph>
          {t('home.title')}
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
          {t('home.subtitle')}
        </Typography>

        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/wizard')}
          sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
        >
          {t('home.startBtn')}
        </Button>
      </Paper>
    </Container>
  );
};

export default HomePage;