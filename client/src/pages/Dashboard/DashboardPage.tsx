import { Box, Grid, Card, Typography, Button, Chip, List, ListItem, ListItemText, ListItemAvatar, Avatar, LinearProgress } from '@mui/material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import AddIcon from '@mui/icons-material/Add'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import GridViewIcon from '@mui/icons-material/GridView'
import FolderIcon from '@mui/icons-material/Folder'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import TuneIcon from '@mui/icons-material/Tune'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import StatsCard from '../../components/ui/StatsCard'
import { useAuthStore } from '../../store/authStore'
import { formatDate } from '../../utils/helpers'

const activityData = [
  { month: 'Jan', projects: 2, generations: 5 },
  { month: 'Feb', projects: 4, generations: 12 },
  { month: 'Mar', projects: 3, generations: 8 },
  { month: 'Apr', projects: 6, generations: 18 },
  { month: 'May', projects: 5, generations: 15 },
  { month: 'Jun', projects: 8, generations: 24 },
]

const recentProjects = [
  { id: '1', title: 'Modern Villa', status: 'in_progress', style: 'modern', updatedAt: new Date().toISOString(), completionPercentage: 65 },
  { id: '2', title: 'Beach House', status: 'planning', style: 'contemporary', updatedAt: new Date(Date.now() - 86400000).toISOString(), completionPercentage: 20 },
  { id: '3', title: 'City Apartment', status: 'review', style: 'minimalist', updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(), completionPercentage: 85 },
]

const quickActions = [
  { label: 'New Project', icon: <AddIcon />, path: '/projects/create', color: '#6C63FF' },
  { label: 'AI Generate', icon: <AutoAwesomeIcon />, path: '/ai-designer', color: '#FF6584' },
  { label: 'Floor Plan', icon: <GridViewIcon />, path: '/projects', color: '#4FC3F7' },
  { label: 'Cost Estimator', icon: <TuneIcon />, path: '/cost-estimator', color: '#66BB6A' },
]

const aiRecommendations = [
  'Consider adding a skylight in the living room for natural lighting.',
  'Your current floor plan could benefit from an open-concept kitchen.',
  'Adding a home office space can increase property value by 15-20%.',
]

const statusColors: Record<string, string> = {
  in_progress: '#2196F3',
  planning: '#FF9800',
  review: '#9C27B0',
  completed: '#4CAF50',
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const aiUsed = user?.subscription?.aiGenerationsUsed ?? 0
  const aiLimit = user?.subscription?.aiGenerationsLimit ?? 5
  const aiPercent = Math.min(100, Math.round((aiUsed / aiLimit) * 100))

  return (
    <Box
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
    >
      {/* Header */}
      <Box component={motion.div} variants={fadeIn} custom={0} sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, letterSpacing: '0.05em' }}>
          {today}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
          Welcome back,{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {user?.name?.split(' ')[0] ?? 'there'}
          </Box>
          !
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Here's what's happening with your projects today.
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { title: 'Total Projects', value: 12, icon: <FolderIcon />, color: '#6C63FF', trend: 8, subtitle: '3 active this month' },
          { title: 'AI Generations', value: aiUsed, icon: <AutoAwesomeIcon />, color: '#FF6584', trend: 20, subtitle: `${aiLimit - aiUsed} remaining` },
          { title: 'Total Floor Area', value: '8,400 ft²', icon: <SquareFootIcon />, color: '#4FC3F7', trend: 12, subtitle: 'Across all projects' },
          { title: 'Saved Designs', value: 7, icon: <HomeWorkIcon />, color: '#66BB6A', trend: 5, subtitle: '2 shared publicly' },
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} lg={3} key={stat.title}>
            <motion.div variants={fadeIn} custom={i + 1}>
              <StatsCard {...stat} />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Activity Chart */}
        <Grid item xs={12} md={8}>
          <Card
            component={motion.div}
            variants={fadeIn}
            custom={5}
            sx={{ p: 3, height: '100%' }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Project Activity
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Last 6 months overview
                </Typography>
              </Box>
              <Chip label="2024" size="small" sx={{ background: 'rgba(108,99,255,0.1)', color: 'primary.main' }} />
            </Box>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="projectGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6584" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6584" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8B8FA8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#8B8FA8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(17,19,24,0.95)',
                    border: '1px solid rgba(108,99,255,0.2)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="projects" stroke="#6C63FF" strokeWidth={2} fill="url(#projectGrad)" name="Projects" />
                <Area type="monotone" dataKey="generations" stroke="#FF6584" strokeWidth={2} fill="url(#genGrad)" name="AI Generations" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* AI Usage */}
            <Card component={motion.div} variants={fadeIn} custom={6} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  AI Usage
                </Typography>
                <Chip
                  label={user?.subscription?.plan?.toUpperCase() ?? 'FREE'}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    background: 'rgba(108,99,255,0.15)',
                    color: 'primary.main',
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {aiUsed} / {aiLimit} generations used
                </Typography>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  {aiPercent}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={aiPercent}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  background: 'rgba(108,99,255,0.15)',
                  '& .MuiLinearProgress-bar': {
                    background: aiPercent > 80
                      ? 'linear-gradient(90deg, #FF6584, #FF9800)'
                      : 'linear-gradient(90deg, #6C63FF, #8B85FF)',
                    borderRadius: 3,
                  },
                }}
              />
              {user?.subscription?.plan === 'free' && (
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{ mt: 2, borderRadius: '8px' }}
                  onClick={() => navigate('/profile')}
                >
                  Upgrade to Pro
                </Button>
              )}
            </Card>

            {/* Quick Actions */}
            <Card component={motion.div} variants={fadeIn} custom={7} sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={1.5}>
                {quickActions.map((action) => (
                  <Grid item xs={6} key={action.label}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={action.icon}
                      onClick={() => navigate(action.path)}
                      sx={{
                        py: 1.5,
                        flexDirection: 'column',
                        gap: 0.5,
                        borderColor: `${action.color}33`,
                        color: action.color,
                        fontSize: '0.75rem',
                        '& .MuiButton-startIcon': { margin: 0 },
                        '&:hover': { background: `${action.color}11`, borderColor: action.color },
                      }}
                    >
                      {action.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Box>
        </Grid>

        {/* Recent Projects */}
        <Grid item xs={12} md={8}>
          <Card component={motion.div} variants={fadeIn} custom={8} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Recent Projects
              </Typography>
              <Button
                size="small"
                variant="text"
                sx={{ color: 'primary.main' }}
                onClick={() => navigate('/projects')}
              >
                View All
              </Button>
            </Box>
            <List disablePadding>
              {recentProjects.map((project, i) => (
                <ListItem
                  key={project.id}
                  disablePadding
                  sx={{
                    py: 1.5,
                    cursor: 'pointer',
                    borderRadius: 2,
                    px: 1,
                    '&:hover': { background: 'rgba(108,99,255,0.05)' },
                    ...(i < recentProjects.length - 1 ? { borderBottom: '1px solid', borderColor: 'divider' } : {}),
                  }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(255,101,132,0.1))',
                        borderRadius: '10px',
                      }}
                    >
                      <HomeWorkIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primaryTypographyProps={{ component: 'div' }}
                    secondaryTypographyProps={{ component: 'div' }}
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {project.title}
                        </Typography>
                        <Chip
                          label={project.status.replace('_', ' ')}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            background: `${statusColors[project.status] ?? '#607D8B'}22`,
                            color: statusColors[project.status] ?? '#607D8B',
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={project.completionPercentage ?? 0}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            background: 'rgba(108,99,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #6C63FF, #FF6584)',
                              borderRadius: 2,
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.3, display: 'block' }}>
                          {project.completionPercentage ?? 0}% complete · {formatDate(project.updatedAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>

        {/* AI Recommendations */}
        <Grid item xs={12} md={4}>
          <Card component={motion.div} variants={fadeIn} custom={9} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'rgba(255,101,132,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 16, color: '#FF6584' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                AI Recommendations
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {aiRecommendations.map((rec, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: 'rgba(108,99,255,0.06)',
                    border: '1px solid rgba(108,99,255,0.1)',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    {rec}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
