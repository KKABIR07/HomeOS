// @ts-nocheck
import { Box, Typography } from '@mui/material'
import { Outlet } from 'react-router-dom'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import { motion } from 'framer-motion'

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (t) =>
          t.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0A0C10 0%, #0D0F18 50%, #0A0C10 100%)'
            : 'linear-gradient(135deg, #F0F2FF 0%, #F8F9FF 50%, #F0F2FF 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Blobs */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,101,132,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ width: '100%', maxWidth: 440, px: 2, position: 'relative', zIndex: 1 }}
      >
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, justifyContent: 'center' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HomeWorkIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
            }}
          >
            HouseOS
          </Typography>
        </Box>

        <Outlet />
      </Box>
    </Box>
  )
}
