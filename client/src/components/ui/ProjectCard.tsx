import { Box, Card, Typography, Chip, IconButton, Menu, MenuItem } from '@mui/material'
import { motion } from 'framer-motion'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../../types/project'
import { formatRelativeDate, formatArea, getStatusColor, getStatusLabel } from '../../utils/helpers'

interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
}

export default function ProjectCard({ project, onEdit, onDelete, onDuplicate }: ProjectCardProps) {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
  }
  const handleMenuClose = () => setAnchorEl(null)

  const projectId = project.id ?? project._id ?? ''

  return (
    <Card
      component={motion.div}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(`/projects/${projectId}`)}
      sx={{
        cursor: 'pointer',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: '0 8px 40px rgba(108,99,255,0.15)',
        },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          height: 160,
          background: project.thumbnail
            ? `url(${project.thumbnail}) center/cover`
            : 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,101,132,0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {!project.thumbnail && (
          <HomeWorkIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.5 }} />
        )}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'flex',
            gap: 1,
            alignItems: 'center',
          }}
        >
          <Chip
            label={getStatusLabel(project.status)}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 600,
              background: `${getStatusColor(project.status)}22`,
              color: getStatusColor(project.status),
              border: `1px solid ${getStatusColor(project.status)}44`,
            }}
          />
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              width: 26,
              height: 26,
              '&:hover': { background: 'rgba(0,0,0,0.7)' },
            }}
          >
            <MoreVertIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Completion Bar */}
        {(project.completionPercentage ?? 0) > 0 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: 'rgba(0,0,0,0.3)',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${project.completionPercentage ?? 0}%`,
                background: 'linear-gradient(90deg, #6C63FF, #FF6584)',
              }}
            />
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary', lineHeight: 1.3 }}
          noWrap
        >
          {project.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary', mb: 1.5, flex: 1, lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}
        >
          {project.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          {project.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <LocationOnIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {project.location}
              </Typography>
            </Box>
          )}
          {project.builtArea > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <SquareFootIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {formatArea(project.builtArea)}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Chip
              label={project.style}
              size="small"
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 500 }}
            />
            <Chip
              label={`${project.floors}F`}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 500 }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {formatRelativeDate(project.updatedAt)}
          </Typography>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{ sx: { minWidth: 160, borderRadius: 2 } }}
      >
        <MenuItem
          onClick={() => { handleMenuClose(); onEdit?.(project) }}
          sx={{ gap: 1.5, fontSize: '0.875rem' }}
        >
          <EditIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => { handleMenuClose(); onDuplicate?.(projectId) }}
          sx={{ gap: 1.5, fontSize: '0.875rem' }}
        >
          <ContentCopyIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          Duplicate
        </MenuItem>
        <MenuItem
          onClick={() => { handleMenuClose(); onDelete?.(projectId) }}
          sx={{ gap: 1.5, fontSize: '0.875rem', color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  )
}
