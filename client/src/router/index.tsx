import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import AppLayout from '../components/shared/Layout/AppLayout'
import AuthLayout from '../components/shared/Layout/AuthLayout'
import LoadingScreen from '../components/shared/LoadingScreen'

import LandingPage from '../pages/Landing/LandingPage'
import LoginPage from '../pages/Auth/LoginPage'
import RegisterPage from '../pages/Auth/RegisterPage'
import ForgotPasswordPage from '../pages/Auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/Auth/ResetPasswordPage'
import DashboardPage from '../pages/Dashboard/DashboardPage'
import ProjectsPage from '../pages/Projects/ProjectsPage'
import CreateProjectPage from '../pages/Projects/CreateProjectPage'
import ProjectDetailPage from '../pages/Projects/ProjectDetailPage'
import FloorPlanEditor from '../pages/FloorPlan/FloorPlanEditor'
import ThreeDViewerPage from '../pages/ThreeDViewer/ThreeDViewerPage'
import AIDesignerPage from '../pages/AIDesigner/AIDesignerPage'
import CostEstimatorPage from '../pages/CostEstimator/CostEstimatorPage'
import InteriorStudioPage from '../pages/Interior/InteriorStudioPage'
import MarketplacePage from '../pages/Marketplace/MarketplacePage'
import ProfilePage from '../pages/Profile/ProfilePage'
import AdminPage from '../pages/Admin/AdminPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuthStore()
  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/create" element={<CreateProjectPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/:id/edit" element={<CreateProjectPage />} />
          <Route path="/projects/:id/floorplan" element={<FloorPlanEditor />} />
          <Route path="/projects/:id/3d" element={<ThreeDViewerPage />} />
          <Route path="/ai-designer" element={<AIDesignerPage />} />
          <Route path="/cost-estimator" element={<CostEstimatorPage />} />
          <Route path="/interior-studio" element={<InteriorStudioPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
