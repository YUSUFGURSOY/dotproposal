import { createTheme } from '@mui/material/styles';

// Mode parametresi alan fonksiyon
export const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode, 
    primary: {
      main: '#1976d2', 
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: mode === 'light' ? '#f4f6f8' : '#121212', // Koyu modda siyah arka plan
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',   // Kartlar için koyu gri
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
          color: mode === 'light' ? '#000000' : '#ffffff',
        }
      }
    }
  }
});