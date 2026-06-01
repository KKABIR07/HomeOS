import { Box, Card, Typography, Skeleton } from '@mui/material'
import { motion } from 'framer-motion'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: string
  trend?: number
  loading?: boolean
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = '#6C63FF',
  trend,
  loading = false,
}: StatsCardProps) {
  if (loading) {
    return (
      <Card sx={{ p: 2.5, height: '100%' }}>
        <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="40%" height={32} sx={{ mt: 0.5 }} />
        <Skeleton variant="text" width="50%" height={14} sx={{ mt: 0.5 }} />
      </Card>
    )
  }

  return (
    <Card
      component={motion.div}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      sx={{
        p: 2.5,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
        },
      }}
    >
      {/* Background Glow */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: `${color}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            '& .MuiSvgIcon-root': { fontSize: 22 },
          }}
        >
          {icon}
        </Box>
        {trend !== undefined && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.3,
              color: trend >= 0 ? '#4CAF50' : '#F44336',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {trend >= 0 ? (
              <ArrowUpwardIcon sx={{ fontSize: 14 }} />
            ) : (
              <ArrowDownwardIcon sx={{ fontSize: 14 }} />
            )}
            {Math.abs(trend)}%
          </Box>
        )}
      </Box>

      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: '-0.02em', color }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
          {subtitle}
        </Typography>
      )}
    </Card>
  )
}
