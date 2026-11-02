import React from 'react';
import { RequestStatus, UrgencyLevel } from '../../types';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blood' | 'urgency' | 'status' | 'neutral' | 'success' | 'warning';
  urgency?: UrgencyLevel;
  status?: RequestStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  urgency,
  status,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (variant === 'blood') {
    colorClasses = 'bg-crimson-50 text-crimson-800 border-crimson-200 font-bold';
  } else if (variant === 'urgency' && urgency) {
    if (urgency === 'CRITICAL') {
      colorClasses = 'bg-red-100 text-red-800 border-red-300 animate-pulse';
    } else if (urgency === 'URGENT') {
      colorClasses = 'bg-amber-100 text-amber-800 border-amber-300';
    } else {
      colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
    }
  } else if (variant === 'status' && status) {
    if (status === 'OPEN') {
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    } else if (status === 'IN_PROGRESS') {
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
    } else if (status === 'FULFILLED') {
      colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
    } else {
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
    }
  } else if (variant === 'success') {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (variant === 'warning') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeClasses[size]} ${colorClasses} ${className}`}
    >
      {children}
    </span>
  );
};
