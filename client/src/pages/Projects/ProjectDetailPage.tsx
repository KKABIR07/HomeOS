import { Box, Grid, Card, Typography, Button, Chip, Tabs, Tab, LinearProgress, Avatar, Skeleton } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import EditIcon from '@mui/icons-material/Edit'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import CalculateIcon from '@mui/icons-material/Calculate'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import BedIcon from '@mui/icons-material/Bed'
import BathtubIcon from '@mui/icons-material/Bathtub'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { useState } from 'react'
import { useProject } from '../../hooks/useProjects'
import { formatCurrency, formatArea, getStatusColor, getStatusLabel, formatDate } from '../../utils/helpers'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const { data: project, isLoading } = useProject(id ?? '')

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 3 }} />
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    )
  }

  if (!project) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>Project not found</Typography>
        <Button onClick={() => navigate('/projects')} sx={{ mt: 2 }}>Back to Projects</Button>
      </Box>
    )
  }

  const projectId = project.id ?? project._id ?? ''

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Hero */}
      <Box
        sx={{
          borderRadius: '20px',
          overflow: 'hidden',
          mb: 3,
          height: 200,
          background: project.coverImage
            ? `url(${project.coverImage}) center/cover`
            : 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(255,101,132,0.1))',
          display: 'flex',
          alignItems: 'flex-end',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
          }}
        />
        <Box sx={{ position: 'relative', p: 3, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            <Chip
              label={getStatusLabel(project.status)}
              size="small"
              sx={{
                mb: 1,
                background: `${getStatusColor(project.status)}33`,
                color: getStatusColor(project.status),
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'white' }}>
              {project.title}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/projects/create?edit=${projectId}`)}
            sx={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', '&:hover': { background: 'rgba(255,255,255,0.25)' } }}
          >
            Edit
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2.5}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
            {[
              { label: 'Floor Plan', icon: <GridViewIcon />, path: `/projects/${projectId}/floorplan`, color: '#6C63FF' },
              { label: '3D Viewer', icon: <ViewInArIcon />, path: `/projects/${projectId}/3d`, color: '#FF6584' },
              { label: 'AI Designer', icon: <AutoAwesomeIcon />, path: '/ai-designer', color: '#4FC3F7' },
              { label: 'Cost Estimate', icon: <CalculateIcon />, path: '/cost-estimator', color: '#66BB6A' },
            ].map((action) => (
              <Button
                key={action.label}
                variant="outlined"
                startIcon={action.icon}
                onClick={() => navigate(action.path)}
                sx={{
                  borderColor: `${action.color}44`,
                  color: action.color,
                  '&:hover': { background: `${action.color}11`, borderColor: action.color },
                }}
              >
                {action.label}
              </Button>
            ))}
          </Box>

          <Card sx={{ mb: 2.5 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
              <Tab label="Overview" sx={{ fontWeight: 600, textTransform: 'none' }} />
              <Tab label="Details" sx={{ fontWeight: 600, textTransform: 'none' }} />
              <Tab label="Collaborators" sx={{ fontWeight: 600, textTransform: 'none' }} />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {tab === 0 && (
                <Box>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3 }}>
                    {project.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Progress</Typography>
                      <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        {project.completionPercentage ?? 0}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={project.completionPercentage ?? 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        background: 'rgba(108,99,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #6C63FF, #FF6584)',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Style', value: project.style },
                      { label: 'Type', value: project.houseType },
                      { label: 'Floors', value: project.floors },
                      { label: 'Created', value: formatDate(project.createdAt) },
                    ].map(({ label, value }) => (
                      <Grid item xs={6} sm={3} key={label}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.06em' }}>
                          {label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.3, textTransform: 'capitalize' }}>
                          {String(value)}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {tab === 1 && (
                <Grid container spacing={2}>
                  {[
                    { label: 'Plot Area', value: formatArea(project.plotArea), icon: <SquareFootIcon /> },
                    { label: 'Built Area', value: formatArea(project.builtArea), icon: <HomeWorkIcon /> },
                    { label: 'Bedrooms', value: project.bedrooms, icon: <BedIcon /> },
                    { label: 'Bathrooms', value: project.bathrooms, icon: <BathtubIcon /> },
                    { label: 'Budget', value: formatCurrency(project.budget), icon: <AttachMoneyIcon /> },
                    { label: 'Location', value: project.location || 'Not set', icon: <LocationOnIcon /> },
                  ].map(({ label, value, icon }) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, background: 'rgba(108,99,255,0.04)', border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ color: 'primary.main' }}>{icon}</Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(value)}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              {tab === 2 && (
                <Box>
                  {project.collaborators?.length > 0 ? (
                    project.collaborators.map((c) => (
                      <Box key={c.userId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, background: 'rgba(108,99,255,0.2)' }}>
                          {c.userId.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.userId}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{c.role}</Typography>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No collaborators yet. Invite someone to collaborate on this project.
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Project Stats */}
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Project Info
              </Typography>
              {[
                { label: 'Status', value: getStatusLabel(project.status), color: getStatusColor(project.status) },
                { label: 'Visibility', value: project.isPublic ? 'Public' : 'Private', color: project.isPublic ? '#4CAF50' : '#607D8B' },
                { label: 'Updated', value: formatDate(project.updatedAt), color: undefined },
              ].map(({ label, value, color }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: color ?? 'text.primary' }}>{value}</Typography>
                </Box>
              ))}
            </Card>

            {/* Cost Estimate */}
            {project.costEstimate && (
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Cost Estimate
                </Typography>
                {[
                  { label: 'Materials', value: formatCurrency(project.costEstimate.materials) },
                  { label: 'Labor', value: formatCurrency(project.costEstimate.labor) },
                  { label: 'Permits', value: formatCurrency(project.costEstimate.permits) },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid', borderColor: 'divider', mt: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {formatCurrency(project.costEstimate.total)}
                  </Typography>
                </Box>
              </Card>
            )}

            {/* Tags */}
            {project.tags?.length > 0 && (
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Tags</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {project.tags.map((tag) => (
                    <Chip key={tag.label} label={tag.label} size="small" sx={{ height: 24, fontSize: '0.75rem' }} />
                  ))}
                </Box>
              </Card>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
