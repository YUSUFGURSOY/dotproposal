/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  
  const navigate = useNavigate();

  // Cooldown Geri Sayım Efekti
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendCode = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await axios.post('https://dotproposal.onrender.com/api/auth/forgot-password', { email });
      setStep(2);
      setMessage({ type: 'success', text: 'Sıfırlama kodu e-postanıza gönderildi (Spam kutusunu kontrol etmeyi unutmayın).' });
      setCooldown(120); // 2 Dakika bekleme süresi
    } catch (error: any) {
      if (error.response?.status === 429) {
        // Eğer backend'den "Bekle" hatası gelirse içindeki saniyeyi yakala
        const msg = error.response.data.message;
        const secondsMatch = msg.match(/\d+/);
        if (secondsMatch) setCooldown(parseInt(secondsMatch[0]));
      }
      setMessage({ type: 'error', text: error.response?.data?.message || 'Bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await axios.post('https://dotproposal.onrender.com/api/auth/reset-password', { email, code, newPassword });
      setMessage({ type: 'success', text: 'Şifreniz başarıyla değiştirildi! Giriş sayfasına yönlendiriliyorsunuz...' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Şifre sıfırlanamadı.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
            Şifremi Unuttum
          </Typography>
          
          {message && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

          {step === 1 && (
            <Box>
              <Typography variant="body2" color="textSecondary" mb={3}>
                Hesabınıza ait e-posta adresini girin, size 6 haneli bir sıfırlama kodu gönderelim.
              </Typography>
              <TextField 
                fullWidth label="E-Posta Adresiniz" variant="outlined" margin="normal"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                fullWidth variant="contained" size="large" sx={{ mt: 2, py: 1.5 }}
                onClick={handleSendCode} 
                disabled={loading || !email || cooldown > 0}
              >
                {loading ? <CircularProgress size={24} /> : cooldown > 0 ? `Tekrar Gönder (${cooldown}s)` : 'KOD GÖNDER'}
              </Button>
            </Box>
          )}

          {step === 2 && (
            <Box>
              <TextField 
                fullWidth label="6 Haneli Kod" variant="outlined" margin="normal"
                value={code} onChange={(e) => setCode(e.target.value)}
              />
              <TextField 
                fullWidth label="Yeni Şifre" type="password" variant="outlined" margin="normal"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button 
                fullWidth variant="contained" size="large" sx={{ mt: 2, py: 1.5, background: '#4caf50' }}
                onClick={handleResetPassword} disabled={loading || !code || !newPassword}
              >
                {loading ? <CircularProgress size={24} /> : 'ŞİFREYİ GÜNCELLE'}
              </Button>

              {/* Cooldown butonu (Tekrar kod istemek için) */}
              <Button 
                fullWidth variant="text" sx={{ mt: 2 }}
                onClick={handleSendCode} disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Kodu Tekrar Gönder (${cooldown}s)` : 'Kodu Tekrar Gönder'}
              </Button>
            </Box>
          )}

          <Button fullWidth sx={{ mt: 2 }} onClick={() => navigate('/login')}>
            Giriş Sayfasına Dön
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;