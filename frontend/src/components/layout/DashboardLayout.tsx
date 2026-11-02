import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  HeartHandshake, 
  FileText, 
  Activity, 
  User, 
  ShieldCheck, 
  PlusCircle, 
  Search, 
  SlidersHorizontal 
} from 'lucide-react';
import { Badge } from '../common/Badge';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  actionButton,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    if (!user) return [];
    if (user.role === 'ROLE_ADMIN') {
      return [
        { label: 'Admin Overview', path: '/dashboard/admin', icon: <ShieldCheck className="w-4 h-4" /> },
        { label: 'All Requests', path: '/requests', icon: <FileText className="w-4 h-4" /> },
        { label: 'Find Donors', path: '/donors', icon: <Search className="w-4 h-4" /> },
        { label: 'Profile', path: '/profile', icon: <User className="w-4 h-4" /> },
      ];
    }
    if (user.role === 'ROLE_DONOR') {
      return [
        { label: 'Donor Dashboard', path: '/dashboard/donor', icon: <Activity className="w-4 h-4" /> },
        { label: 'Matching Requests', path: '/requests', icon: <FileText className="w-4 h-4" /> },
        { label: 'Profile & Availability', path: '/profile', icon: <User className="w-4 h-4" /> },
      ];
    }
    // Requester
    return [
      { label: 'My Requests', path: '/dashboard/requester', icon: <FileText className="w-4 h-4" /> },
      { label: 'Create Request', path: '/requests/create', icon: <PlusCircle className="w-4 h-4" /> },
      { label: 'Search Donors', path: '/donors', icon: <Search className="w-4 h-4" /> },
      { label: 'Profile', path: '/profile', icon: <User className="w-4 h-4" /> },
    ];
  };

  const navItems = getNavItems();

  const getRoleLabel = () => {
    if (user?.role === 'ROLE_ADMIN') return 'Administrator';
    if (user?.role === 'ROLE_DONOR') return 'Volunteer Donor';
    return 'Requester';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Signed in as</div>
            <div className="font-bold text-slate-900 truncate">{user?.fullName || 'User'}</div>
            <div className="text-xs text-slate-500 truncate mb-2">{user?.email}</div>
            <Badge variant="neutral" size="sm" className="bg-slate-200/70 text-slate-700">
              {getRoleLabel()}
            </Badge>
          </div>

          <nav className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">Menu</div>
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-crimson-50 text-crimson-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100 text-xs text-slate-400">
          <p>RaktSetu v1.0.0</p>
          <p>Educational Prototype</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {actionButton && <div>{actionButton}</div>}
        </div>
        {children}
      </main>
    </div>
  );
};
