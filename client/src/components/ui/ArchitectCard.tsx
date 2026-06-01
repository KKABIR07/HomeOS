// @ts-nocheck
import { Box, Card, Typography, Avatar, Chip, Button, Rating } from '@mui/material'
import { motion } from 'framer-motion'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import WorkIcon from '@mui/icons-material/Work'
import type { ArchitectProfile } from '../../types/project'
import { getInitials } from '../../utils/helpers'

interface ArchitectCardProps {
  architect: ArchitectProfile
  onHire?: (architect: ArchitectProfile) => void
  onViewProfile?: (architect: ArchitectProfile) => void
}

export default function ArchitectCard({ architect, onHire, onViewProfile }: ArchitectCardProps) {
  return (
    <Card
      component={motion.div}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      sx={{
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: '0 8px 40px rgba(108,99,255,0.15)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={architect.avatar ?? undefined}
            sx={{
              width: 60,
              height: 60,
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              fontSize: '1.2rem',
              fontWeight: 700,
            }}
          >
            {getInitials(architect.name)}
          </Avatar>
          {architect.available && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#4CAF50',
                border: '2px solid',
                borderColor: 'background.paper',
              }}
            />
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
            {architect.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
            <Rating value={architect.rating} readOnly size="small" precision={0.5} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              ({architect.reviewCount})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.3 }}>
            <LocationOnIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
              {architect.location}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Bio */}
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          mb: 2,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.5,
          flex: 1,
        }}
      >
        {architect.bio}
      </Typography>

      {/* Specializations */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
        {architect.specialization.slice(0, 3).map((spec) => (
          <Chip
            key={spec}
            label={spec}
            size="small"
            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 500 }}
          />
        ))}
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
            {architect.projectCount}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Projects
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
            {architect.experience}y
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Experience
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', ml: 'auto' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
            ${architect.hourlyRate}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Per Hour
          </Typography>
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={() => onViewProfile?.(architect)}
          sx={{ borderRadius: '8px' }}
        >
          View Profile
        </Button>
        <Button
          variant="contained"
          size="small"
          fullWidth
          onClick={() => onHire?.(architect)}
          disabled={!architect.available}
          sx={{ borderRadius: '8px' }}
        >
          {architect.available ? 'Hire' : 'Unavailable'}
        </Button>
      </Box>
    </Card>
  )
}
