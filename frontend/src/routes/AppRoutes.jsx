import { Routes, Route } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import TransferPage from '../pages/TransferPage';
import HistoryPage from '../pages/HistoryPage';
import ProfilePage from '../pages/ProfilePage';
import SavingsPage from '../pages/SavingsPage';
import HelpPage from '../pages/HelpPage';
import ComingSoonPage from '../pages/ComingSoonPage';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Capstone modules (in scope) */}
      <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/transfer"  element={<Protected><TransferPage /></Protected>} />
      <Route path="/history"   element={<Protected><HistoryPage /></Protected>} />
      <Route path="/profile"   element={<Protected><ProfilePage /></Protected>} />
      <Route path="/savings"   element={<Protected><SavingsPage /></Protected>} />
      <Route path="/help"      element={<Protected><HelpPage /></Protected>} />

      {/* Backlog placeholders */}
      <Route path="/coming-soon"    element={<Protected><ComingSoonPage /></Protected>} />
      <Route path="/qris"           element={<Protected><ComingSoonPage /></Protected>} />
      <Route path="/topup"          element={<Protected><ComingSoonPage /></Protected>} />
      <Route path="/payment"        element={<Protected><ComingSoonPage /></Protected>} />
      <Route path="/notifications"  element={<Protected><ComingSoonPage /></Protected>} />
    </Routes>
  );
}

export default AppRoutes;
