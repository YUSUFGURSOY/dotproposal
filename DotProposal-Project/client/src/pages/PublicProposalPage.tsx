/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Container, Paper, Typography, Box, CircularProgress, Divider, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

const PageWrapper = styled(Box)({
  minHeight: '100vh',
  background: '#f4f6f8', // Müşteriye daha sade, kurumsal bir gri arka plan
  paddingTop: '60px',
  paddingBottom: '80px',
});

const PublicProposalPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchPublicProposal = async () => {
      try {
        // DİKKAT: Token göndermiyoruz, açık rotaya istek atıyoruz!
        const response = await axios.get(`http://localhost:5001/api/proposals/public/${id}`);
        setProposal(response.data);
      } catch (err) {
        setError('Bu teklif bulunamadı veya süresi dolmuş olabilir.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPublicProposal();
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (error || !proposal) return <Typography align="center" mt={10} variant="h5" color="textSecondary">{error}</Typography>;

  return (
    <PageWrapper>
      <Container maxWidth="md">
        <Paper elevation={4} sx={{ p: { xs: 3, md: 6 }, backgroundColor: '#ffffff', borderRadius: 3 }}>
          
          <Box sx={{ borderBottom: '2px solid #eee', pb: 2, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#2c3e50', fontWeight: 'bold' }}>
              {proposal.jobTitle}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip label={proposal.companyName} size="small" sx={{ background: '#e3f2fd', color: '#2e7d32', fontWeight: 'bold' }} />
              <Typography variant="body2" color="textSecondary">
                Tarih: {new Date(proposal.createdAt).toLocaleDateString('tr-TR')}
              </Typography>
            </Box>
          </Box>

          <Box className="markdown-content">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2, color: '#1976d2', fontWeight: 'bold' }} {...props} />,
                h2: ({node, ...props}) => <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2, color: '#34495e', fontWeight: 'bold', borderBottom:'1px solid #eee', pb: 1 }} {...props} />,
                p: ({node, ...props}) => <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: '#424242' }} {...props} />,
                li: ({node, ...props}) => <li style={{ marginBottom: '10px', color: '#424242', lineHeight: 1.6 }} {...props} />,
                strong: ({node, ...props}) => <strong style={{ color: '#1976d2' }} {...props} />
              }}
            >
              {proposal.generatedCoverLetter}
            </ReactMarkdown>
          </Box>

          <Divider sx={{ my: 5 }} />
          <Typography variant="body2" align="center" color="textSecondary">
            Bu doküman size özel olarak hazırlanmıştır.
          </Typography>
        </Paper>
      </Container>
    </PageWrapper>
  );
};

export default PublicProposalPage;