/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Avatar, Grid, CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { updateUserProfile, reset } from '../features/auth/authSlice';
import type { AppDispatch, RootState } from '../app/store';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [title, setTitle] = useState(user?.title || 'Freelancer'); // Varsayılan değer
  const [githubLink, setGithubLink] = useState((user as any)?.githubLink || ''); // 👇 YENİ EKLENDİ
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    if (isError) {
      enqueueSnackbar(message, { variant: 'error' });
      dispatch(reset());
    }

    if (isSuccess && message === 'Profil güncellendi!') {
      enqueueSnackbar(t('auth.profileUpdated', 'Profil başarıyla güncellendi!'), { variant: 'success' });
      dispatch(reset());
    }
  }, [isError, isSuccess, message, dispatch, enqueueSnackbar, t]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // FormData oluştur (Dosya göndermek için şart)
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('title', title);
    formData.append('githubLink', githubLink); // 👇 YENİ EKLENDİ
    
    if (cvFile) {
      formData.append('cvFile', cvFile); // Backend'de 'upload.single('cvFile')' demiştik
    }

    dispatch(updateUserProfile(formData));
  };

  // Backend'den gelen dosya yolunu düzeltme (Windows ters slash sorunu için)
  const getCvLink = () => {
    if (!user?.cvFileName) return null;
    // https://dotproposal.onrender.com/uploads/dosyaadi.pdf
    return `https://dotproposal.onrender.com/uploads/${user.cvFileName}`;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* SOL TARA: AVATAR VE BİLGİ */}
          <Grid size={{ xs: 12, md:4}} display="flex" flexDirection="column" alignItems="center">
            <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: 40, mb: 2 }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="h6">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            
            {user?.cvFileName && (
               <Button 
                 variant="outlined" 
                 sx={{ mt: 2 }} 
                 href={getCvLink() || '#'} 
                 target="_blank"
               >
                 📄 Mevcut CV'yi Gör
               </Button>
            )}
          </Grid>

          {/* SAĞ TARAF: GÜNCELLEME FORMU */}
          <Grid size={{ xs: 12, md:8}}>
            <Typography variant="h5" mb={3} fontWeight="bold">
              {t('nav.profile', 'Profil Ayarları')}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth label={t('auth.fullName', 'Ad Soyad')}
                value={name} onChange={(e) => setName(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth label={t('auth.email', 'E-Posta')}
                value={email} onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                disabled // E-posta değişimi güvenlik gerektirir, şimdilik kapalı
              />
              <TextField
                fullWidth label="Ünvan (Örn: Frontend Developer)"
                value={title} onChange={(e) => setTitle(e.target.value)}
                margin="normal"
                placeholder="Mesleğinizi girin"
              />
              
              {/* 👇 YENİ EKLENDİ: GITHUB INPUT */}
              <TextField
                fullWidth label="GitHub Profil Linki (Opsiyonel)"
                value={githubLink} onChange={(e) => setGithubLink(e.target.value)}
                margin="normal"
                placeholder="Örn: https://github.com/kullaniciadi"
              />

              {/* DOSYA YÜKLEME ALANI */}
              <Box sx={{ mt: 2, border: '1px dashed grey', p: 2, borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="body2" gutterBottom>
                  {cvFile ? `Seçilen Dosya: ${cvFile.name}` : 'Henüz CV yüklenmedi'}
                </Typography>
                
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  size="small"
                >
                  CV Yükle / Güncelle (PDF)
                  <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
                </Button>
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3, py: 1.5 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Bilgileri Güncelle'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProfilePage;