import { Routes, Route } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import TransferPage from '../pages/TransferPage';
import HistoryPage from '../pages/HistoryPage';
import MainLayout from '../layouts/MainLayout';

function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        }
      />

      <Route
        path="/history"
        element={
          <MainLayout>
            <HistoryPage />
          </MainLayout>
        }
      />

      {/* Transfer */}
      <Route
        path="/transfer"
        element={
          <MainLayout>
            <TransferPage />
          </MainLayout>
        }
      />
    </Routes>
  );
}

export default AppRoutes;