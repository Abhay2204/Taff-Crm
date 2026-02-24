import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Prospect from './pages/FollowUp/Prospect';
import FollowUp from './pages/FollowUp/FollowUp';
import ScheduleReport from './pages/FollowUp/ScheduleReport';
import ViewProspect from './pages/FollowUp/ViewProspect';
import SearchProspect from './pages/FollowUp/SearchProspect';
import FollowUpRegister from './pages/FollowUp/FollowUpRegister';
import StaffMaster from './pages/Masters/StaffMaster';
import './styles/global.css';
import './styles/components.css';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="follow-up">
              <Route path="prospect" element={<Prospect />} />
              <Route path="follow-up" element={<FollowUp />} />
              <Route path="schedule-report" element={<ScheduleReport />} />
              <Route path="view-prospect" element={<ViewProspect />} />
              <Route path="search-prospect" element={<SearchProspect />} />
              <Route path="register" element={<FollowUpRegister />} />
            </Route>
            <Route path="masters">
              <Route path="staff" element={<StaffMaster />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
