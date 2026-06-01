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
import GridViewIcon from '@mui/icons-material/GridView'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import CalculateIcon from '@mui/icons-material/Calculate'
import BrushIcon from '@mui/icons-material/Brush'
import StorefrontIcon from '@mui/icons-material/Storefront'
import PersonIcon from '@mui/icons-material/Person'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import LogoutIcon from '@mui/icons-material/Logout'
import TerrainIcon from '@mui/icons-material/Terrain'
import ConstructionIcon from '@mui/icons-material/Construction'
import ForestIcon from '@mui/icons-material/Forest'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import EngineeringIcon from '@mui/icons-material/Engineering'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import VideocamIcon from '@mui/icons-material/Videocam'
import GavelIcon from '@mui/icons-material/Gavel'
import ScienceIcon from '@mui/icons-material/Science'
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService'
import DesignServicesIcon from '@mui/icons-material/DesignServices'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import ForumIcon from '@mui/icons-material/Forum'
import DevicesOtherIcon from '@mui/icons-material/DevicesOther'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../../store/authStore'
import { useUIStore } from '../../../store/uiStore'
import { getInitials } from '../../../utils/helpers'
import toast from 'react-hot-toast'

const DRAWER_WIDTH = 260
const COLLAPSED_WIDTH = 72

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  adminOnly?: boolean
  group?: string
}

const navItems: NavItem[] = [
  // Overview
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, group: 'Overview' },
  { label: 'Projects', path: '/projects', icon: <FolderIcon />, group: 'Overview' },
  // Design
  { label: 'AI Designer', path: '/ai-designer', icon: <AutoAwesomeIcon />, group: 'Design' },
  { label: 'Floor Plan', path: '/projects', icon: <GridViewIcon />, group: 'Design' },
  { label: '3D Viewer', path: '/projects', icon: <ViewInArIcon />, group: 'Design' },
  { label: 'Interior Studio', path: '/interior-studio', icon: <BrushIcon />, group: 'Design' },
  // Analysis
  { label: 'Site Intelligence', path: '/site-intelligence', icon: <TerrainIcon />, group: 'Analysis' },
  { label: 'Materials DB', path: '/materials', icon: <ConstructionIcon />, group: 'Analysis' },
  { label: 'Cost Estimator', path: '/cost-estimator', icon: <CalculateIcon />, group: 'Analysis' },
  // Planning
  { label: 'Landscape & Water', path: '/landscape', icon: <ForestIcon />, group: 'Planning' },
  { label: 'Electrical & Solar', path: '/electrical', icon: <ElectricBoltIcon />, group: 'Planning' },
  // Management
  { label: 'Construction Mgr', path: '/construction', icon: <EngineeringIcon />, group: 'Management' },
  { label: 'AI Assistant', path: '/ai-assistant', icon: <SmartToyIcon />, group: 'Management' },
  // Property
  { label: 'Property Intel', path: '/property-intel', icon: <LocationOnIcon />, group: 'Property' },
  // Construction
  { label: 'Construction Monitor', path: '/construction-monitor', icon: <VideocamIcon />, group: 'Construction' },
  { label: 'Compliance & Safety', path: '/compliance', icon: <GavelIcon />, group: 'Construction' },
  // Simulations
  { label: 'Simulations', path: '/simulations', icon: <ScienceIcon />, group: 'Simulations' },
  // Home AI
  { label: 'Home Intelligence', path: '/home-intel', icon: <HomeRepairServiceIcon />, group: 'Home AI' },
  { label: 'Smart Home', path: '/smart-home', icon: <DevicesOtherIcon />, group: 'Home AI' },
  // Design+
  { label: 'Design Tools', path: '/design-tools', icon: <DesignServicesIcon />, group: 'Design+' },
  // Finance
  { label: 'Finance Hub', path: '/finance', icon: <AccountBalanceIcon />, group: 'Finance' },
  // Community
  { label: 'Community', path: '/community', icon: <ForumIcon />, group: 'Community' },
  // More
  { label: 'Marketplace', path: '/marketplace', icon: <StorefrontIcon />, group: 'More' },
  { label: 'Profile', path: '/profile', icon: <PersonIcon />, group: 'More' },
  { label: 'Admin', path: '/admin', icon: <AdminPanelSettingsIcon />, adminOnly: true, group: 'More' },
]

const NAV_GROUPS = ['Overview', 'Design', 'Analysis', 'Planning', 'Management', 'Property', 'Construction', 'Simulations', 'Home AI', 'Design+', 'Finance', 'Community', 'More']

function NavList({ isCollapsed, userRole, currentPath, onNavigate }: {
  isCollapsed: boolean; userRole?: string; currentPath: string; onNavigate: (path: string) => void
}) {
  return (
    <List sx={{ px: 1.5, flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 0.5 }}>
      {NAV_GROUPS.map(group => {
        const items = navItems.filter(
          item => item.group === group && (!item.adminOnly || userRole === 'admin')
        )
        if (items.length === 0) return null
        return (
          <React.Fragment key={group}>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Typography variant="caption"
                    sx={{ px: 1, pt: 1.5, pb: 0.5, display: 'block', color: 'text.disabled', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.65rem' }}>
                    {group.toUpperCase()}
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
            {isCollapsed && <Divider sx={{ my: 0.5, opacity: 0.1 }} />}
            {items.map(item => {
              const isActive = currentPath === item.path ||
                (item.path !== '/dashboard' && item.path !== '/projects' && currentPath.startsWith(item.path))
              return (
                <Tooltip key={item.label} title={isCollapsed ? item.label : ''} placement="right" arrow>
                  <ListItemButton
                    component={motion.div as any}
                    whileHover={{ x: isCollapsed ? 0 : 2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onNavigate(item.path)}
                    sx={{
                      mb: 0.3, borderRadius: '10px', minHeight: 40,
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      px: isCollapsed ? 1.5 : 2,
                      background: isActive ? 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(255,101,132,0.08))' : 'transparent',
                      border: isActive ? '1px solid rgba(108,99,255,0.2)' : '1px solid transparent',
                      '&:hover': { background: isActive ? 'linear-gradient(135deg, rgba(108,99,255,0.25), rgba(255,101,132,0.1))' : 'rgba(108,99,255,0.06)' },
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? '#6C63FF' : 'text.secondary', minWidth: isCollapsed ? 0 : 34, mr: isCollapsed ? 0 : 1, '& .MuiSvgIcon-root': { fontSize: 19 } }}>
                      {item.icon}
                    </ListItemIcon>
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          <ListItemText primary={item.label}
                            primaryTypographyProps={{ fontSize: '0.838rem', fontWeight: isActive ? 600 : 500, color: isActive ? 'primary.main' : 'text.secondary' }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </ListItemButton>
                </Tooltip>
              )
            })}
          </React.Fragment>
        )
      })}
    </List>
  )
}

interface DrawerContentProps {
  isCollapsed: boolean; isMobile: boolean; user: any
  currentPath: string
  onNavigate: (path: string) => void
  onToggleCollapse: () => void; onLogout: () => void
}

function DrawerContent({ isCollapsed, isMobile, user, currentPath, onNavigate, onToggleCollapse, onLogout }: DrawerContentProps) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' } as any}>
      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', px: isCollapsed ? 1 : 2.5, py: 2.5, minHeight: 70 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #6C63FF, #FF6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <HomeWorkIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6C63FF, #FF6584)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
                  HouseOS
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
        {!isMobile && !isCollapsed && <IconButton size="small" onClick={onToggleCollapse} sx={{ color: 'text.secondary' }}><ChevronLeftIcon fontSize="small" /></IconButton>}
        {!isMobile && isCollapsed && <IconButton size="small" onClick={onToggleCollapse} sx={{ color: 'text.secondary', mt: 0.5 }}><ChevronRightIcon fontSize="small" /></IconButton>}
      </Box>

      <Divider sx={{ opacity: 0.1, mb: 1 }} />

      <NavList isCollapsed={isCollapsed} userRole={user?.role} currentPath={currentPath} onNavigate={onNavigate} />

      <Divider sx={{ opacity: 0.1, mt: 1 }} />

      {/* User section */}
      <Box sx={{ px: isCollapsed ? 1 : 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
        <Avatar src={user?.avatar ?? undefined} sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6C63FF, #FF6584)', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0, cursor: 'pointer' }} onClick={() => onNavigate('/profile')}>
          {user?.name ? getInitials(user.name) : 'U'}
        </Avatar>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>{user?.name ?? 'User'}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }} noWrap>{user?.subscription?.plan ?? 'Free'}</Typography>
            </motion.div>
          )}
        </AnimatePresence>
        {!isCollapsed && (
          <Tooltip title="Logout">
            <IconButton size="small" onClick={onLogout} sx={{ color: 'text.secondary' }}><LogoutIcon fontSize="small" /></IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  )
}

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user, logout } = useAuthStore()
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, toggleSidebarCollapsed } = useUIStore()

  const isCollapsed = sidebarCollapsed && !isMobile
  const width = isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const drawerProps: DrawerContentProps = {
    isCollapsed, isMobile, user, currentPath: location.pathname,
    onNavigate: (path) => { navigate(path); if (isMobile) setSidebarOpen(false) },
    onToggleCollapse: toggleSidebarCollapsed, onLogout: handleLogout,
  }

  if (isMobile) {
    return (
      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH,
            background: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(10, 12, 16, 0.97)' : 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <DrawerContent {...drawerProps} />
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
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(11, 13, 18, 0.9)'
            : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        zIndex: 100,
      }}
    >
      <DrawerContent {...drawerProps} />
    </Box>
  )
}
