import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CustomerDashboard } from '../components/dashboard/CustomerDashboard';
import { CourierDashboard } from '../components/dashboard/CourierDashboard';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Route to the distinct, tailored dashboard based on role
  if (user?.role === 'CUSTOMER') {
    return <CustomerDashboard />;
  }

  if (user?.role === 'COURIER') {
    return <CourierDashboard />;
  }

  // Default to Admin / Jury view for ADMIN or unassigned roles
  return <AdminDashboard />;
};
