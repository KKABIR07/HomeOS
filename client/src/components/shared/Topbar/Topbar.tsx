// @ts-nocheck
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import NotificationsIcon from '@mui/icons-material/Notifications'
import AddIcon from '@mui/icons-material/Add'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import { useAuthStore } from '../../../store/authStore'
import { useUIStore } from '../../../store/uiStore'
import { getInitials } from '../../../utils/helpers'
import toast from 'react-hot-toast'

interface TopbarProps {
  title?: string
}

export default function Topbar({ title }: TopbarProps) {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user, logout } = useAuthStore()
  const { themeMode, toggleTheme, toggleSidebar } = useUIStore()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const handleLogout = async () => {
    handleMenuClose()
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: (t) =>
          t.palette.mode === 'dark'
            ? 'rgba(10,12,16,0.8)'
            : 'rgba(248,249,255,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        zIndex: 99,
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: '64px !important' }}>
        {isMobile && (
          <IconButton
            size="medium"
            onClick={toggleSidebar}
            sx={{ color: 'text.secondary' }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {title && (
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: 'text.primary', flexGrow: { xs: 1, md: 0 } }}
          >
            {title}
          </Typography>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Subscription Badge */}
        {user?.subscription && (
          <Chip
            label={user.subscription.plan.toUpperCase()}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              background:
                user.subscription.plan === 'pro'
                  ? 'linear-gradient(135deg, #6C63FF, #FF6584)'
                  : user.subscription.plan === 'enterprise'
                  ? 'linear-gradient(135deg, #FFD700, #FF8C00)'
                  : 'rgba(108,99,255,0.15)',
              color: user.subscription.plan !== 'free' ? 'white' : 'primary.main',
              border: 'none',
              display: { xs: 'none', sm: 'flex' },
            }}
          />
        )}

        {/* Quick Add */}
        <Tooltip title="New Project">
          <IconButton
            size="small"
            onClick={() => navigate('/projects/create')}
            sx={{
              color: 'white',
              background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
              width: 32,
              height: 32,
              '&:hover': {
                background: 'linear-gradient(135deg, #5750D9, #7A73EE)',
                transform: 'scale(1.05)',
              },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton size="medium" sx={{ color: 'text.secondary' }}>
            <Badge badgeContent={3} color="error" variant="dot">
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip title={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <IconButton size="medium" onClick={toggleTheme} sx={{ color: 'text.secondary' }}>
            {themeMode === 'dark' ? (
              <LightModeIcon fontSize="small" />
            ) : (
              <DarkModeIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {/* Avatar Menu */}
        <Tooltip title="Account">
          <Avatar
            src={user?.avatar ?? undefined}
            onClick={handleMenuOpen}
            sx={{
              width: 34,
              height: 34,
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: 'primary.main',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            {user?.name ? getInitials(user.name) : 'U'}
          </Avatar>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundImage: 'none',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {user?.name ?? 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user?.email ?? ''}
            </Typography>
          </Box>
          <MenuItem
            onClick={() => { handleMenuClose(); navigate('/profile') }}
            sx={{ gap: 1.5, fontSize: '0.875rem' }}
          >
            <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => { handleMenuClose(); navigate('/profile') }}
            sx={{ gap: 1.5, fontSize: '0.875rem' }}
          >
            <SettingsIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ gap: 1.5, fontSize: '0.875rem', color: 'error.main' }}>
            <LogoutIcon fontSize="small" />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
