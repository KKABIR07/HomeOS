// @ts-nocheck
import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  MenuItem,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import type { UserRole } from '../../types/user'

export default function RegisterPage() {
  const { handleRegister, isLoading, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as UserRole,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    clearError()
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    if (!validate()) return
    await handleRegister({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    })
  }

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        p: 4,
        background: (t) =>
          t.palette.mode === 'dark' ? 'rgba(17,19,24,0.8)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, textAlign: 'center' }}>
        Create your account
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mb: 3 }}>
        Start designing your dream home today
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Full Name"
          value={formData.name}
          onChange={handleChange('name')}
          error={!!errors.name}
          helperText={errors.name}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
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
          label="Account Type"
          select
          value={formData.role}
          onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))}
          fullWidth
        >
          <MenuItem value="user">Homeowner / Builder</MenuItem>
          <MenuItem value="architect">Architect / Designer</MenuItem>
        </TextField>

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange('password')}
          error={!!errors.password}
          helperText={errors.password}
          fullWidth
          inputProps={{ autoComplete: 'new-password' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          fullWidth
          inputProps={{ autoComplete: 'new-password' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShowConfirm(!showConfirm)} edge="end">
                  {showConfirm ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                </IconButton>
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
            '&:disabled': { opacity: 0.7 },
          }}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>

        <Divider sx={{ my: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>or</Typography>
        </Divider>

        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          Already have an account?{' '}
          <Typography
            component={Link}
            to="/login"
            variant="body2"
            sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
          >
            Sign in
          </Typography>
        </Typography>
      </Box>
    </Card>
  )
}
