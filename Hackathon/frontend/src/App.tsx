import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ShipmentsPage } from './pages/ShipmentsPage';
import { EvidencePage } from './pages/EvidencePage';
import { DisputesPage } from './pages/DisputesPage';
import { AdminPage } from './pages/AdminPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { SecurityPage } from './pages/SecurityPage';
import { COMapping } from './pages/COMapping';
import { ProjectBoardPage } from './pages/ProjectBoardPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/shipments" element={<ShipmentsPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/disputes" element={<DisputesPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/co-mapping" element={<COMapping />} />
            <Route path="/board" element={<ProjectBoardPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
