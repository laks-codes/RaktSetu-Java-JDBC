import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-crimson-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user has wrong role, navigate to their respective dashboard
    let fallback = '/';
    if (user.role === 'ROLE_ADMIN') fallback = '/dashboard/admin';
    else if (user.role === 'ROLE_DONOR') fallback = '/dashboard/donor';
    else if (user.role === 'ROLE_REQUESTER') fallback = '/dashboard/requester';

    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};
