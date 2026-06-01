import { createTheme, type Theme, type PaletteMode } from '@mui/material'

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
          primary: {
            main: '#6C63FF',
            light: '#8B85FF',
            dark: '#4D44E0',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#FF6584',
            light: '#FF85A0',
            dark: '#E04060',
            contrastText: '#FFFFFF',
          },
          background: {
            default: '#0A0C10',
            paper: '#111318',
          },
          text: {
            primary: '#F0F2FF',
            secondary: '#8B8FA8',
          },
          divider: 'rgba(108, 99, 255, 0.12)',
          error: { main: '#FF5252' },
          warning: { main: '#FFB74D' },
          success: { main: '#66BB6A' },
          info: { main: '#42A5F5' },
        }
      : {
          primary: {
            main: '#6C63FF',
            light: '#8B85FF',
            dark: '#4D44E0',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#FF6584',
            light: '#FF85A0',
            dark: '#E04060',
            contrastText: '#FFFFFF',
          },
          background: {
            default: '#F8F9FF',
            paper: '#FFFFFF',
          },
          text: {
            primary: '#1A1C2E',
            secondary: '#6B7280',
          },
          divider: 'rgba(108, 99, 255, 0.1)',
          error: { main: '#EF5350' },
          warning: { main: '#FFA726' },
          success: { main: '#4CAF50' },
          info: { main: '#2196F3' },
        }),
  },
})

export const createAppTheme = (mode: PaletteMode): Theme =>
  createTheme({
    ...getDesignTokens(mode),
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.03em' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.015em' },
      h4: { fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      subtitle2: { fontWeight: 500 },
      body1: { lineHeight: 1.6 },
      body2: { lineHeight: 1.6 },
      button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            boxSizing: 'border-box',
          },
          '::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '::-webkit-scrollbar-thumb': {
            background: mode === 'dark' ? 'rgba(108,99,255,0.3)' : 'rgba(108,99,255,0.2)',
            borderRadius: '3px',
          },
          '::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(108,99,255,0.5)',
          },
          html: {
            scrollBehavior: 'smooth',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 20px',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
            },
          },
          contained: {
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: 'none',
            border:
              mode === 'dark'
                ? '1px solid rgba(108,99,255,0.08)'
                : '1px solid rgba(108,99,255,0.06)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              '& fieldset': {
                borderColor:
                  mode === 'dark' ? 'rgba(108,99,255,0.2)' : 'rgba(108,99,255,0.15)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(108,99,255,0.4)',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            fontSize: '0.75rem',
            fontWeight: 500,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
    },
  })

export const glassmorphism = (mode: PaletteMode) => ({
  background:
    mode === 'dark'
      ? 'rgba(17, 19, 24, 0.7)'
      : 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:
    mode === 'dark'
      ? '1px solid rgba(108, 99, 255, 0.1)'
      : '1px solid rgba(108, 99, 255, 0.08)',
})
