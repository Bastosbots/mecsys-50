
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/AdminDashboard';
import MechanicDashboard from '@/components/MechanicDashboard';

const Dashboard = () => {
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      document.title = profile.role === 'admin' ? 'Dashboard Admin - MecSys' : 'Dashboard Mecânico - MecSys';
    } else {
      document.title = 'Dashboard - MecSys';
    }
  }, [profile]);

  return profile?.role === 'admin' ? (
    <AdminDashboard />
  ) : (
    <MechanicDashboard />
  );
};

export default Dashboard;
