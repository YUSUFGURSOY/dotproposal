/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, TextField, Button, Typography, Box, Avatar, Grid, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions // 👇 YENİ IMPORTLAR
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom'; // Yönlendirme için
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // Danger zone ikonu
import { updateUserProfile, deleteUserAccount, reset } from '../features/auth/authSlice';
import type { AppDispatch, RootState } from '../app/store';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [title, setTitle] = useState(user?.title || 'Freelancer'); 
  const [githubLink, setGithubLink] = useState((user as any)?.githubLink || ''); 
  const [cvFile, setCvFile] = useState<File | null>(null);

  // 👇 YENİ: DANGER ZONE (Hesap Silme) State'leri
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  useEffect(() => {
    if (isError) {
      enqueueSnackbar(message, { variant: 'error' });
      dispatch(reset());
    }

    if (isSuccess && message === 'Profil güncellendi!') {
      enqueueSnackbar(t('auth.profileUpdated', 'Profil başarıyla güncellendi!'), { variant: 'success' });
      dispatch(reset());
    }

    // 👇 YENİ: Hesap başarıyla silindiyse login'e at
    if (isSuccess && message === 'Hesabınız ve tüm verileriniz başarıyla silindi.') {
      enqueueSnackbar('Hesabınız kalıcı olarak silindi. Elveda!', { variant: 'info' });
      dispatch(reset());
      navigate('/register');
    }
  }, [isError, isSuccess, message, dispatch, enqueueSnackbar, t, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('title', title);
    formData.append('githubLink', githubLink); 
    if (cvFile) formData.append('cvFile', cvFile); 

    dispatch(updateUserProfile(formData));
  };

  const getCvLink = () => {
    if (!user?.cvFileName) return null;
    if (user.cvFileName.startsWith('http')) return user.cvFileName; 
    return `https://dotproposal.onrender.com/uploads/${user.cvFileName}`;
  };

  // 👇 YENİ: Hesap Silme Fonksiyonları
  const handleDeleteClick = () => setOpenDeleteModal(true);
  const handleDeleteClose = () => {
    setOpenDeleteModal(false);
    setDeleteConfirmationText(''); // Kapatınca kutuyu temizle
  };
  const confirmDeleteAccount = () => {
    dispatch(deleteUserAccount());
    setOpenDeleteModal(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          {/* SOL TARA: AVATAR VE BİLGİ */}
          <Grid size={{ xs: 12, md:4}} display="flex" flexDirection="column" alignItems="center">
            <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: 40, mb: 2 }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="h6">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            
            {user?.cvFileName && (
               <Button variant="outlined" sx={{ mt: 2 }} href={getCvLink() || '#'} target="_blank">
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
              <TextField fullWidth label={t('auth.fullName', 'Ad Soyad')} value={name} onChange={(e) => setName(e.target.value)} margin="normal" />
              <TextField fullWidth label={t('auth.email', 'E-Posta')} value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" disabled />
              <TextField fullWidth label="Ünvan (Örn: Frontend Developer)" value={title} onChange={(e) => setTitle(e.target.value)} margin="normal" />
              <TextField fullWidth label="GitHub Profil Linki (Opsiyonel)" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} margin="normal" />

              {/* DOSYA YÜKLEME ALANI */}
              <Box sx={{ mt: 2, border: '1px dashed grey', p: 2, borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="body2" gutterBottom>
                  {cvFile ? `Seçilen Dosya: ${cvFile.name}` : 'Henüz CV yüklenmedi'}
                </Typography>
                <Button variant="contained" component="label" startIcon={<CloudUploadIcon />} size="small">
                  CV Yükle / Güncelle (PDF)
                  <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
                </Button>
              </Box>

              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, py: 1.5 }} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Bilgileri Güncelle'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 👇 YENİ: DANGER ZONE (Tehlikeli Bölge) */}
      <Paper elevation={0} sx={{ p: 4, border: '1px solid #ff4d4f', borderRadius: 2, bgcolor: 'rgba(255, 77, 79, 0.05)' }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <WarningAmberIcon color="error" />
          <Typography variant="h6" color="error" fontWeight="bold">
            Tehlikeli Bölge
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Hesabınızı sildiğinizde sistemdeki tüm verileriniz, oluşturduğunuz teklifler ve profiliniz kalıcı olarak silinir. Bu işlem kesinlikle <strong>geri alınamaz.</strong>
        </Typography>
        <Button variant="outlined" color="error" onClick={handleDeleteClick} sx={{ fontWeight: 'bold' }}>
          Hesabımı Kalıcı Olarak Sil
        </Button>
      </Paper>

      {/* 👇 YENİ: GITHUB TARZI ONAY MODALI */}
      <Dialog open={openDeleteModal} onClose={handleDeleteClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#ff4d4f' }}>Hesabı Silmek Üzeresiniz</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Bu işlem DotProposal hesabınızı ve tüm verilerinizi kalıcı olarak silecektir. Lütfen bu işlemi onaylamak için aşağıdaki alana <strong>{user?.email}</strong> adresinizi yazın.
          </DialogContentText>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder={user?.email}
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            error={deleteConfirmationText.length > 0 && deleteConfirmationText !== user?.email}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleDeleteClose} color="inherit">
            İptal
          </Button>
          <Button 
            onClick={confirmDeleteAccount} 
            variant="contained" 
            color="error" 
            disabled={deleteConfirmationText !== user?.email || isLoading}
          >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Sonuçları Kabul Ediyorum, Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;