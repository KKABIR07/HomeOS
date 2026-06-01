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
import SiteIntelligencePage from '../pages/SiteIntelligence/SiteIntelligencePage'
import MaterialsDatabasePage from '../pages/Materials/MaterialsDatabasePage'
import LandscapeDesignPage from '../pages/Landscape/LandscapeDesignPage'
import ElectricalPlanningPage from '../pages/Electrical/ElectricalPlanningPage'
import ConstructionManagerPage from '../pages/Construction/ConstructionManagerPage'
import AIAssistantPage from '../pages/AIAssistant/AIAssistantPage'
import PropertyIntelligencePage from '../pages/PropertyIntelligence/PropertyIntelligencePage'
import ConstructionMonitorPage from '../pages/ConstructionMonitor/ConstructionMonitorPage'
import CompliancePage from '../pages/Compliance/CompliancePage'
import SimulationsPage from '../pages/Simulations/SimulationsPage'
import HomeIntelligencePage from '../pages/HomeIntelligence/HomeIntelligencePage'
import DesignToolsPage from '../pages/DesignTools/DesignToolsPage'
import FinanceHubPage from '../pages/FinanceHub/FinanceHubPage'
import CommunityPage from '../pages/Community/CommunityPage'
import SmartHomePage from '../pages/SmartHome/SmartHomePage'

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
          <Route path="/site-intelligence" element={<SiteIntelligencePage />} />
          <Route path="/materials" element={<MaterialsDatabasePage />} />
          <Route path="/landscape" element={<LandscapeDesignPage />} />
          <Route path="/electrical" element={<ElectricalPlanningPage />} />
          <Route path="/construction" element={<ConstructionManagerPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/property-intel" element={<PropertyIntelligencePage />} />
          <Route path="/construction-monitor" element={<ConstructionMonitorPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/simulations" element={<SimulationsPage />} />
          <Route path="/home-intel" element={<HomeIntelligencePage />} />
          <Route path="/design-tools" element={<DesignToolsPage />} />
          <Route path="/finance" element={<FinanceHubPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/smart-home" element={<SmartHomePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
