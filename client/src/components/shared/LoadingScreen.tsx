import { Box, CircularProgress, Typography } from '@mui/material'
import { motion } from 'framer-motion'

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
}

export default function LoadingScreen({ message = 'Loading...', fullScreen = true }: LoadingScreenProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: fullScreen ? '100vh' : '100%',
        minHeight: fullScreen ? undefined : 200,
        gap: 2,
        background: fullScreen
          ? 'linear-gradient(135deg, #0A0C10 0%, #0D0F18 50%, #0A0C10 100%)'
          : 'transparent',
      }}
    >
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress
          size={56}
          thickness={2}
          sx={{
            color: '#6C63FF',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        <Box
          component={motion.div}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          sx={{
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#FF6584',
            borderRightColor: 'transparent',
          }}
        />
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontSize: '0.7rem',
        }}
      >
        {message}
      </Typography>
    </Box>
  )
}
