import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { AboutPage } from '../pages/AboutPage';
import { HowItWorksPage } from '../pages/HowItWorksPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DonorSearchPage } from '../pages/donors/DonorSearchPage';
import { DonorDetailPage } from '../pages/donors/DonorDetailPage';
import { RequestListPage } from '../pages/requests/RequestListPage';
import { RequestDetailPage } from '../pages/requests/RequestDetailPage';
import { CreateRequestPage } from '../pages/requests/CreateRequestPage';
import { RequesterDashboard } from '../pages/dashboards/RequesterDashboard';
import { DonorDashboard } from '../pages/dashboards/DonorDashboard';
import { AdminDashboard } from '../pages/dashboards/AdminDashboard';
import { ProfilePage } from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/donors" element={<DonorSearchPage />} />
      <Route path="/donors/:id" element={<DonorDetailPage />} />
      <Route path="/requests" element={<RequestListPage />} />
      <Route path="/requests/:id" element={<RequestDetailPage />} />

      {/* Protected Routes */}
      <Route
        path="/requests/create"
        element={
          <ProtectedRoute>
            <CreateRequestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/requester"
        element={
          <ProtectedRoute allowedRoles={['ROLE_REQUESTER', 'ROLE_ADMIN']}>
            <RequesterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/donor"
        element={
          <ProtectedRoute allowedRoles={['ROLE_DONOR', 'ROLE_ADMIN']}>
            <DonorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* 404 Pages */}
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
};
