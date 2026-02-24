import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

// Follow Up
import Prospect from './pages/FollowUp/Prospect';
import FollowUp from './pages/FollowUp/FollowUp';
import ScheduleReport from './pages/FollowUp/ScheduleReport';
import ViewProspect from './pages/FollowUp/ViewProspect';
import SearchProspect from './pages/FollowUp/SearchProspect';
import FollowUpRegister from './pages/FollowUp/FollowUpRegister';

// Sales
import Quotation from './pages/Sales/Quotation';
import Invoice from './pages/Sales/Invoice';
import DeliveryChallan from './pages/Sales/DeliveryChallan';
import DeliveredVehicles from './pages/Sales/DeliveredVehicles';
import PaymentReceipt from './pages/Sales/PaymentReceipt';
import SalesReport from './pages/Sales/SalesReport';

// Service
import ServiceManagement from './pages/Service/ServiceManagement';
import TodayServices from './pages/Service/TodayServices';
import UpcomingServices from './pages/Service/UpcomingServices';
import ServiceReport from './pages/Service/ServiceReport';

// Masters
import VehicleMaster from './pages/Masters/VehicleMaster';
import StaffMaster from './pages/Masters/StaffMaster';

import './styles/global.css';
import './styles/components.css';
import './styles/login.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />

              {/* Follow Up */}
              <Route path="follow-up">
                <Route path="prospect" element={<Prospect />} />
                <Route path="follow-up" element={<FollowUp />} />
                <Route path="schedule-report" element={<ScheduleReport />} />
                <Route path="view-prospect" element={<ViewProspect />} />
                <Route path="search-prospect" element={<SearchProspect />} />
                <Route path="register" element={<FollowUpRegister />} />
              </Route>

              {/* Sales */}
              <Route path="sales">
                <Route path="quotation" element={<Quotation />} />
                <Route path="invoice" element={<Invoice />} />
                <Route path="delivery" element={<DeliveryChallan />} />
                <Route path="delivered-vehicles" element={<DeliveredVehicles />} />
                <Route path="receipt" element={<PaymentReceipt />} />
                <Route path="report" element={<SalesReport />} />
              </Route>

              {/* Service */}
              <Route path="service">
                <Route path="all" element={<ServiceManagement />} />
                <Route path="today" element={<TodayServices />} />
                <Route path="upcoming" element={<UpcomingServices />} />
                <Route path="report" element={<ServiceReport />} />
              </Route>

              {/* Masters */}
              <Route path="masters">
                <Route path="vehicle" element={<VehicleMaster />} />
                <Route path="staff" element={<StaffMaster />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
