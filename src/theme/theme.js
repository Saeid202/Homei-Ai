import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB', // Vibrant blue for trust and growth
      light: '#3B82F6',
      dark: '#1D4ED8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#F97316', // Warm orange for energy and urgency
      light: '#FB923C',
      dark: '#EA580C',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8FAFC', // Soft blue-gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    success: { 
      main: '#10B981', // Bright green for success and money
      light: '#34D399',
      dark: '#059669',
    },
    warning: { 
      main: '#F59E0B', // Warm amber
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: { 
      main: '#EF4444', // Bright red
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#06B6D4', // Cyan for info
      light: '#22D3EE',
      dark: '#0891B2',
    },
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { 
      fontWeight: 800, 
      fontSize: '3rem', 
      lineHeight: 1.1,
      color: '#0F172A',
      letterSpacing: '-0.025em',
    },
    h2: { 
      fontWeight: 700, 
      fontSize: '2.25rem', 
      lineHeight: 1.2,
      color: '#0F172A',
      letterSpacing: '-0.025em',
    },
    h3: { 
      fontWeight: 700, 
      fontSize: '1.875rem', 
      lineHeight: 1.3,
      color: '#0F172A',
      letterSpacing: '-0.025em',
    },
    h4: { 
      fontWeight: 600, 
      fontSize: '1.5rem', 
      lineHeight: 1.4,
      color: '#0F172A',
      letterSpacing: '-0.025em',
    },
    h5: { 
      fontWeight: 600, 
      fontSize: '1.25rem', 
      lineHeight: 1.4,
      color: '#0F172A',
      letterSpacing: '-0.025em',
    },
    h6: { 
      fontWeight: 600, 
      fontSize: '1.125rem', 
      lineHeight: 1.4,
      color: '#0F172A',
      letterSpacing: '-0.025em',
    },
    body1: { 
      fontSize: '1rem', 
      lineHeight: 1.7,
      color: '#334155',
      fontWeight: 400,
    },
    body2: { 
      fontSize: '0.875rem', 
      lineHeight: 1.6,
      color: '#64748B',
      fontWeight: 400,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.025em',
    },
  },
  shape: { 
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '14px 28px',
          boxShadow: 'none',
          border: '1px solid transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.875rem',
          letterSpacing: '0.025em',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
            boxShadow: '0 12px 32px rgba(37, 99, 235, 0.3)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
            boxShadow: '0 12px 32px rgba(249, 115, 22, 0.3)',
          },
        },
        outlined: {
          borderColor: '#E2E8F0',
          color: '#334155',
          '&:hover': {
            borderColor: '#2563EB',
            background: 'rgba(37, 99, 235, 0.04)',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)',
          },
        },
        text: {
          color: '#334155',
          '&:hover': {
            background: 'rgba(37, 99, 235, 0.04)',
          },
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '1rem',
        },
        sizeSmall: {
          padding: '10px 20px',
          fontSize: '0.75rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
          border: '1px solid #F1F5F9',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
          border: '1px solid #F1F5F9',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.12)',
        },
        elevation3: {
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            background: '#ffffff',
            transition: 'all 0.2s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#94A3B8',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2563EB',
              borderWidth: 2,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#2563EB',
              fontWeight: 600,
            },
          },
          '& .MuiInputBase-input': {
            fontSize: '1rem',
            padding: '16px 20px',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 56,
          '& .MuiTabs-indicator': {
            height: 4,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 56,
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
          color: '#64748B',
          letterSpacing: '0.025em',
          '&.Mui-selected': {
            color: '#2563EB',
            fontWeight: 700,
          },
          '&:hover': {
            color: '#2563EB',
            background: 'rgba(37, 99, 235, 0.04)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 28,
          '&.MuiChip-colorPrimary': {
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            color: '#ffffff',
          },
          '&.MuiChip-colorSecondary': {
            background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            color: '#ffffff',
          },
          '&.MuiChip-colorSuccess': {
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#ffffff',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          fontSize: '0.875rem',
        },
        standardSuccess: {
          background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
          color: '#065F46',
          border: '1px solid #10B981',
        },
        standardError: {
          background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
          color: '#991B1B',
          border: '1px solid #EF4444',
        },
        standardWarning: {
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          color: '#92400E',
          border: '1px solid #F59E0B',
        },
        standardInfo: {
          background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
          color: '#1E40AF',
          border: '1px solid #3B82F6',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
          borderRight: '1px solid #E2E8F0',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          '&:hover': {
            background: 'rgba(37, 99, 235, 0.04)',
          },
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
            color: '#1E40AF',
            fontWeight: 600,
          },
        },
      },
    },
  },
}); 