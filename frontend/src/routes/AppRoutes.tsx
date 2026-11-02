import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DonorSearchPage } from '../pages/donors/DonorSearchPage';
import { CreateRequestPage } from '../pages/requests/CreateRequestPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/donors" element={<ProtectedRoute><DonorSearchPage /></ProtectedRoute>} />
    <Route path="/requests/create" element={<ProtectedRoute><CreateRequestPage /></ProtectedRoute>} />
    <Route path="/not-found" element={<NotFoundPage />} />
    <Route path="*" element={<Navigate to="/not-found" replace />} />
  </Routes>
);
