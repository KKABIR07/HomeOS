import { useEffect } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createAppTheme } from './theme/theme'
import { useUIStore } from './store/uiStore'
import { useAuthStore } from './store/authStore'
import AppRouter from './router'

export default function App() {
  const { themeMode } = useUIStore()
  const { checkAuth } = useAuthStore()
  const theme = createAppTheme(themeMode)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  )
}
