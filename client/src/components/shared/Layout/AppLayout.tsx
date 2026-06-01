// @ts-nocheck
import { Box } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Topbar from '../Topbar/Topbar'
import { useEffect } from 'react'
import { useUIStore } from '../../../store/uiStore'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/projects/create': 'Create Project',
  '/ai-designer': 'AI Designer',
  '/cost-estimator': 'Cost Estimator',
  '/interior-studio': 'Interior Studio',
  '/marketplace': 'Marketplace',
  '/profile': 'Profile',
  '/admin': 'Admin Panel',
}

export default function AppLayout() {
  const location = useLocation()
  const { setActiveRoute } = useUIStore()

  useEffect(() => {
    setActiveRoute(location.pathname)
  }, [location.pathname, setActiveRoute])

  const title = pageTitles[location.pathname] ?? 'HouseOS'

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <Topbar title={title} />
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            p: { xs: 2, md: 3 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
