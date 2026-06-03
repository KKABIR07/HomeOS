// @ts-nocheck
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
  IconButton,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FolderIcon from '@mui/icons-material/Folder'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import StorefrontIcon from '@mui/icons-material/Storefront'
import PersonIcon from '@mui/icons-material/Person'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import LogoutIcon from '@mui/icons-material/Logout'
import EngineeringIcon from '@mui/icons-material/Engineering'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ScienceIcon from '@mui/icons-material/Science'
import DesignServicesIcon from '@mui/icons-material/DesignServices'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BarChartIcon from '@mui/icons-material/BarChart'
import EventNoteIcon from '@mui/icons-material/EventNote'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import ConstructionIcon from '@mui/icons-material/Construction'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../../store/authStore'
import { useUIStore } from '../../../store/uiStore'
import { useProjectStore } from '../../../store/projectStore'
import { getInitials } from '../../../utils/helpers'
import toast from 'react-hot-toast'

const DRAWER_WIDTH = 240
const COLLAPSED_WIDTH = 68

// ── Global nav (no active project) ────────────────────────────────────────────
const GLOBAL_NAV = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Projects', path: '/projects', icon: <FolderIcon /> },
  { label: 'Marketplace', path: '/marketplace', icon: <StorefrontIcon /> },
  { label: 'Profile', path: '/profile', icon: <PersonIcon /> },
]

// ── Project-scoped nav (shown when a project is open) ─────────────────────────
const getProjectNav = (projectId: string) => [
  { label: 'Overview', path: `/projects/${projectId}`, icon: <DashboardIcon /> },
  { label: 'Design', path: `/projects/${projectId}/design`, icon: <DesignServicesIcon /> },
  { label: '3D View', path: `/projects/${projectId}/3d`, icon: <ViewInArIcon /> },
  { label: 'Analysis', path: `/projects/${projectId}/analysis`, icon: <BarChartIcon /> },
  { label: 'Planning', path: `/projects/${projectId}/planning`, icon: <EventNoteIcon /> },
  { label: 'Management', path: `/projects/${projectId}/management`, icon: <ManageAccountsIcon /> },
  { label: 'Property', path: `/projects/${projectId}/property`, icon: <LocationOnIcon /> },
  { label: 'Construction', path: `/projects/${projectId}/construction`, icon: <EngineeringIcon /> },
  { label: 'Simulations', path: `/projects/${projectId}/simulations`, icon: <ScienceIcon /> },
  { label: 'Home AI', path: `/projects/${projectId}/home-ai`, icon: <SmartToyIcon /> },
  { label: 'Design+', path: `/projects/${projectId}/design-plus`, icon: <AutoAwesomeIcon /> },
  { label: 'Finance', path: `/projects/${projectId}/finance`, icon: <AccountBalanceIcon /> },
]

// ── Shared nav item ────────────────────────────────────────────────────────────
function NavItem({ item, isCollapsed, currentPath }: { item: any; isCollapsed: boolean; currentPath: string }) {
  const navigate = useNavigate()
  const { setSidebarOpen } = useUIStore()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const isActive =
    currentPath === item.path ||
    (item.path.split('/').length > 2 && currentPath.startsWith(item.path))

  return (
    <Tooltip title={isCollapsed ? item.label : ''} placement="right" arrow>
      <ListItemButton
        component={motion.div as any}
        whileHover={{ x: isCollapsed ? 0 : 3 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          navigate(item.path)
          if (isMobile) setSidebarOpen(false)
        }}
        sx={{
          mb: 0.25,
          borderRadius: '10px',
          minHeight: 40,
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          px: isCollapsed ? 1.5 : 1.8,
          background: isActive
            ? 'linear-gradient(135deg, rgba(108,99,255,0.18), rgba(255,101,132,0.07))'
            : 'transparent',
          border: isActive ? '1px solid rgba(108,99,255,0.18)' : '1px solid transparent',
          '&:hover': {
            background: isActive
              ? 'linear-gradient(135deg, rgba(108,99,255,0.24), rgba(255,101,132,0.1))'
              : 'rgba(108,99,255,0.06)',
          },
        }}
      >
        <ListItemIcon
          sx={{
            color: isActive ? '#6C63FF' : 'text.secondary',
            minWidth: isCollapsed ? 0 : 32,
            mr: isCollapsed ? 0 : 1,
            '& .MuiSvgIcon-root': { fontSize: 18 },
          }}
        >
          {item.icon}
        </ListItemIcon>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.825rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'primary.main' : 'text.secondary',
                  letterSpacing: '0.02em',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </ListItemButton>
    </Tooltip>
  )
}

// ── Global sidebar content ─────────────────────────────────────────────────────
function GlobalContent({ isCollapsed, isMobile, user, currentPath, onToggleCollapse, onLogout }) {
  const navigate = useNavigate()
  const { user: authUser } = useAuthStore()
  const adminItem = { label: 'Admin', path: '/admin', icon: <AdminPanelSettingsIcon /> }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          px: isCollapsed ? 1 : 2.5,
          py: 2.5,
          minHeight: 68,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/dashboard')}
          >
            <HomeWorkIcon sx={{ color: 'white', fontSize: 18 }} />
          </Box>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                    fontSize: '1.05rem',
                  }}
                >
                  HouseOS
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
        {!isMobile && !isCollapsed && (
          <IconButton size="small" onClick={onToggleCollapse} sx={{ color: 'text.secondary' }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
        {!isMobile && isCollapsed && (
          <IconButton size="small" onClick={onToggleCollapse} sx={{ color: 'text.secondary', mt: 0.5 }}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ opacity: 0.1, mx: 1.5 }} />

      {/* Nav */}
      <List sx={{ px: 1.5, flex: 1, overflowY: 'auto', py: 1 }}>
        {GLOBAL_NAV.map((item) => (
          <NavItem key={item.path} item={item} isCollapsed={isCollapsed} currentPath={currentPath} />
        ))}
        {authUser?.role === 'admin' && (
          <NavItem item={adminItem} isCollapsed={isCollapsed} currentPath={currentPath} />
        )}
      </List>

      <Divider sx={{ opacity: 0.1, mx: 1.5 }} />

      {/* User */}
      <Box
        sx={{
          px: isCollapsed ? 1 : 2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        }}
      >
        <Avatar
          src={user?.avatar ?? undefined}
          sx={{
            width: 34,
            height: 34,
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            fontSize: '0.8rem',
            fontWeight: 700,
            flexShrink: 0,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/profile')}
        >
          {user?.name ? getInitials(user.name) : 'U'}
        </Avatar>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}
            >
              <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}>
                {user?.name ?? 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }} noWrap>
                {user?.subscription?.plan ?? 'Free'}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
        {!isCollapsed && (
          <Tooltip title="Logout">
            <IconButton size="small" onClick={onLogout} sx={{ color: 'text.secondary' }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  )
}

// ── Project sidebar content ────────────────────────────────────────────────────
function ProjectContent({ isCollapsed, isMobile, user, currentPath, projectId, projectName, onToggleCollapse, onLogout }) {
  const navigate = useNavigate()
  const { setSidebarOpen } = useUIStore()
  const projectNav = getProjectNav(projectId)

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header: back + logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: isCollapsed ? 1 : 2,
          py: 1.8,
          minHeight: 68,
        }}
      >
        <Tooltip title="Back to Projects" placement="right">
          <IconButton
            size="small"
            onClick={() => {
              navigate('/projects')
              if (isMobile) setSidebarOpen(false)
            }}
            sx={{
              color: 'text.secondary',
              flexShrink: 0,
              '&:hover': { color: 'primary.main' },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}
            >
              <Typography
                variant="caption"
                sx={{ color: 'text.disabled', fontWeight: 600, letterSpacing: '0.08em', fontSize: '0.62rem' }}
              >
                PROJECT
              </Typography>
              <Typography
                variant="body2"
                noWrap
                sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3, fontSize: '0.875rem' }}
              >
                {projectName}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
        {!isMobile && !isCollapsed && (
          <IconButton size="small" onClick={onToggleCollapse} sx={{ color: 'text.secondary', flexShrink: 0 }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
        {!isMobile && isCollapsed && (
          <IconButton size="small" onClick={onToggleCollapse} sx={{ color: 'text.secondary' }}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ opacity: 0.1, mx: 1.5 }} />

      {/* Section label */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Typography
              variant="caption"
              sx={{
                px: 2.5,
                pt: 1.5,
                pb: 0.5,
                display: 'block',
                color: 'text.disabled',
                fontWeight: 700,
                letterSpacing: '0.1em',
                fontSize: '0.6rem',
              }}
            >
              WORKSPACE
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project nav */}
      <List sx={{ px: 1.5, flex: 1, overflowY: 'auto', py: 0.5 }}>
        {projectNav.map((item) => (
          <NavItem key={item.path} item={item} isCollapsed={isCollapsed} currentPath={currentPath} />
        ))}
      </List>

      <Divider sx={{ opacity: 0.1, mx: 1.5 }} />

      {/* User */}
      <Box
        sx={{
          px: isCollapsed ? 1 : 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        }}
      >
        <Avatar
          src={user?.avatar ?? undefined}
          sx={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            fontSize: '0.75rem',
            fontWeight: 700,
            flexShrink: 0,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/profile')}
        >
          {user?.name ? getInitials(user.name) : 'U'}
        </Avatar>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}
            >
              <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2, fontSize: '0.8rem' }}>
                {user?.name ?? 'User'}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
        {!isCollapsed && (
          <Tooltip title="Logout">
            <IconButton size="small" onClick={onLogout} sx={{ color: 'text.secondary' }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  )
}

// ── Main Sidebar ───────────────────────────────────────────────────────────────
export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user, logout } = useAuthStore()
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, toggleSidebarCollapsed } = useUIStore()
  const { currentProject } = useProjectStore()

  // Detect project context from URL
  const pathParts = location.pathname.split('/').filter(Boolean)
  const isProjectMode =
    pathParts[0] === 'projects' && !!pathParts[1] && pathParts[1] !== 'create'
  const activeProjectId = isProjectMode ? pathParts[1] : null
  const projectName = currentProject?.projectName || currentProject?.title || 'Project'

  const isCollapsed = sidebarCollapsed && !isMobile
  const width = isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const sharedProps = {
    isCollapsed,
    isMobile,
    user,
    currentPath: location.pathname,
    onToggleCollapse: toggleSidebarCollapsed,
    onLogout: handleLogout,
  }

  const content = isProjectMode ? (
    <ProjectContent
      {...sharedProps}
      projectId={activeProjectId}
      projectName={projectName}
    />
  ) : (
    <GlobalContent {...sharedProps} />
  )

  if (isMobile) {
    return (
      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH,
            background: (t) =>
              t.palette.mode === 'dark' ? 'rgba(10, 12, 16, 0.97)' : 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {content}
      </Drawer>
    )
  }

  return (
    <Box
      component={motion.div}
      animate={{ width }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      sx={{
        width,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: (t) =>
          t.palette.mode === 'dark' ? 'rgba(11, 13, 18, 0.9)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        zIndex: 100,
      }}
    >
      {content}
    </Box>
  )
}
