import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import LoginPage from '../pages/LoginPage';
import DashboardLayout from '../layouts/DashboardLayout';
import Overview from '../pages/Overview';
import DriverDatabase from '../pages/DriverDatabase';
import ApproveDriver from '../pages/ApproveDriver';
import UserManagement from '../pages/UserManagement';
import DriverTimesheets from '../pages/DriverTimesheets';
import TimesheetCalculation from '../pages/TimesheetCalculation';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
         
          <Route path="approve" element={<ApproveDriver />} />
          <Route path="driver" element={<DriverDatabase />} />
          <Route path="timesheets" element={<DriverTimesheets />} />
          <Route path="timesheets/calculation/:employeeId" element={<TimesheetCalculation />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
        
        {/* Redirect Root to Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
