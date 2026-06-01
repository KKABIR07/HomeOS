import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Card, TextField, Button, Typography, Alert, InputAdornment } from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { motion } from 'framer-motion'
import { authService } from '../../services/authService'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Invalid email address'); return }
    setIsLoading(true)
    setError('')
    try {
      await authService.forgotPassword(email)
      setSuccess(true)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message ?? 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        sx={{
          p: 4,
          textAlign: 'center',
          background: (t) => t.palette.mode === 'dark' ? 'rgba(17,19,24,0.8)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(76,175,80,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 32, color: '#4CAF50' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Check your email
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          We sent a password reset link to <strong>{email}</strong>
        </Typography>
        <Button
          component={Link}
          to="/login"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          sx={{ borderRadius: '10px' }}
        >
          Back to Login
        </Button>
      </Card>
    )
  }

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        p: 4,
        background: (t) => t.palette.mode === 'dark' ? 'rgba(17,19,24,0.8)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, textAlign: 'center' }}>
        Forgot password?
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mb: 3 }}>
        Enter your email and we'll send you a reset link
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError('') }}
          error={!!error}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

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
          }}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <Button
          component={Link}
          to="/login"
          variant="text"
          startIcon={<ArrowBackIcon />}
          sx={{ color: 'text.secondary' }}
        >
          Back to Login
        </Button>
      </Box>
    </Card>
  )
}
