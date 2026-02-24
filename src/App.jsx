import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Prospect from './pages/FollowUp/Prospect';
import FollowUp from './pages/FollowUp/FollowUp';
import ScheduleReport from './pages/FollowUp/ScheduleReport';
import ViewProspect from './pages/FollowUp/ViewProspect';
import SearchProspect from './pages/FollowUp/SearchProspect';
import FollowUpRegister from './pages/FollowUp/FollowUpRegister';
import StaffMaster from './pages/Masters/StaffMaster';
import Quotation from './pages/Sales/Quotation';
import DeliveredVehicles from './pages/Sales/DeliveredVehicles';
import ServiceManagement from './pages/Service/ServiceManagement';
import TodayServices from './pages/Service/TodayServices';
import UpcomingServices from './pages/Service/UpcomingServices';
import ServiceReport from './pages/Service/ServiceReport';
import './styles/global.css';
import './styles/components.css';
import './styles/login.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route - Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes - Admin Panel */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="follow-up">
                <Route path="prospect" element={<Prospect />} />
                <Route path="follow-up" element={<FollowUp />} />
                <Route path="schedule-report" element={<ScheduleReport />} />
                <Route path="view-prospect" element={<ViewProspect />} />
                <Route path="search-prospect" element={<SearchProspect />} />
                <Route path="register" element={<FollowUpRegister />} />
              </Route>
              <Route path="sales">
                <Route path="quotation" element={<Quotation />} />
                <Route path="delivered-vehicles" element={<DeliveredVehicles />} />
              </Route>
              <Route path="service">
                <Route path="all" element={<ServiceManagement />} />
                <Route path="today" element={<TodayServices />} />
                <Route path="upcoming" element={<UpcomingServices />} />
                <Route path="report" element={<ServiceReport />} />
              </Route>
              <Route path="masters">
                <Route path="staff" element={<StaffMaster />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
