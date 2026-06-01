// @ts-nocheck
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { handleLogin, isLoading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!email) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    if (!validate()) return
    await handleLogin(email, password)
  }

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        p: 4,
        background: (t) =>
          t.palette.mode === 'dark'
            ? 'rgba(17,19,24,0.8)'
            : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, textAlign: 'center' }}>
        Welcome back
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mb: 3 }}>
        Sign in to your HouseOS account
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearError() }}
          error={!!errors.email}
          helperText={errors.email}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => { setPassword(e.target.value); clearError() }}
          error={!!errors.password}
          helperText={errors.password}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? (
                    <VisibilityOffIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <VisibilityIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ textAlign: 'right', mt: -1 }}>
          <Typography
            component={Link}
            to="/forgot-password"
            variant="body2"
            sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Forgot password?
          </Typography>
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isLoading}
          sx={{
            py: 1.3,
            background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
            '&:hover': { background: 'linear-gradient(135deg, #5750D9, #7A73EE)' },
            '&:disabled': { opacity: 0.7 },
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <Divider sx={{ my: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            or
          </Typography>
        </Divider>

        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          Don't have an account?{' '}
          <Typography
            component={Link}
            to="/register"
            variant="body2"
            sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
          >
            Sign up
          </Typography>
        </Typography>
      </Box>
    </Card>
  )
}
