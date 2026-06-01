import { Box, Typography, Button } from '@mui/material'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '20px',
          background: 'rgba(108,99,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          color: 'primary.main',
          '& .MuiSvgIcon-root': { fontSize: 36 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', mb: 3, maxWidth: 360, lineHeight: 1.7 }}
      >
        {description}
      </Typography>
      {action && (
        <Button
          variant="contained"
          onClick={action.onClick}
          sx={{ borderRadius: '10px', px: 3 }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  )
}
