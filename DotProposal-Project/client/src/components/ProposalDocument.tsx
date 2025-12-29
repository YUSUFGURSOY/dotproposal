// src/components/ProposalDocument.tsx
import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Grid, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Props Tipleri
interface ProposalDocumentProps {
  clientName: string;
  projectDescription: string;
  items: string[];
  totalPrice: number;
}

// ref kullanımı için forwardRef kullanıyoruz (Yazdırma kütüphanesi için gerekli)
export const ProposalDocument = React.forwardRef<HTMLDivElement, ProposalDocumentProps>((props, ref) => {
  const { clientName, projectDescription, items, totalPrice } = props;
  const today = new Date().toLocaleDateString('tr-TR');

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, bgcolor: '#e0e0e0', minHeight: '100vh' }}>
      {/* A4 Kağıdı Görünümü */}
      <Paper 
        ref={ref} // Yazdırma referansı buraya bağlanıyor
        elevation={5} 
        sx={{ 
          width: '210mm', // A4 Genişliği
          minHeight: '297mm', // A4 Yüksekliği
          p: '20mm', // Kenar boşlukları
          bgcolor: 'white',
          boxSizing: 'border-box'
        }}
      >
        {/* ÜST BİLGİ (HEADER) */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               DotProposal
            </Typography>
            <Typography variant="caption" color="text.secondary">AI Destekli Teklif Sistemi</Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="h6" color="text.secondary">TEKLİF DETAYI</Typography>
            <Typography variant="body2">Tarih: {today}</Typography>
            <Typography variant="body2" fontWeight="bold">Teklif No: #DP-2024-001</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* MÜŞTERİ BİLGİLERİ */}
        <Grid container spacing={3} mb={4}>
           <Grid size={{ xs: 6 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>SAYIN:</Typography>
            <Typography variant="h6" fontWeight="bold">{clientName || 'Sayın Müşteri'}</Typography>
            <Typography variant="body2" color="text.secondary">
              Proje Talebi: {projectDescription.slice(0, 50)}...
            </Typography>
          </Grid>
        <Grid size={{ xs: 6 }} textAlign="right">
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>HAZIRLAYAN:</Typography>
            <Typography variant="h6">Freelance Yazılımcı</Typography>
            <Typography variant="body2">yazilimci@dotproposal.com</Typography>
          </Grid>
        </Grid>

        {/* İŞ KALEMLERİ TABLOSU */}
        <Typography variant="h6" gutterBottom sx={{ mt: 4, color: 'primary.main' }}>
          Hizmet Kapsamı ve Fiyatlandırma
        </Typography>
        
        <TableContainer sx={{ mb: 4, border: '1px solid #eee', borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell width="70%"><Typography fontWeight="bold">Yapılacak İş / Modül</Typography></TableCell>
                <TableCell align="right"><Typography fontWeight="bold">Tahmini Tutar</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      {item}
                    </Box>
                  </TableCell>
                  {/* Örnek olarak toplam tutarı eşit böldük, backend olunca her kalemin fiyatı ayrı gelecek */}
                  <TableCell align="right">
                    {(totalPrice / items.length).toFixed(2)} ₺
                  </TableCell>
                </TableRow>
              ))}
              
              {/* BOŞLUK DOLDURMA (Görsel bütünlük için) */}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Henüz iş kalemi oluşturulmadı.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* TOPLAM FİYAT ALANI */}
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Box sx={{ width: '250px', bgcolor: 'primary.main', color: 'white', p: 2, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="subtitle1" align="right">TOPLAM TUTAR</Typography>
            <Typography variant="h4" align="right" fontWeight="bold">
              {totalPrice.toLocaleString('tr-TR')} ₺
            </Typography>
          </Box>
        </Box>

        {/* ALT BİLGİ (FOOTER) */}
        <Box sx={{ mt: 10, textAlign: 'center', color: 'text.secondary' }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption">
            Bu teklif DotProposal yapay zeka altyapısı ile otomatik olarak oluşturulmuştur.
            30 gün süreyle geçerlidir.
          </Typography>
        </Box>

      </Paper>
    </Box>
  );
});

// React DevTools'da ismin doğru görünmesi için
ProposalDocument.displayName = 'ProposalDocument';