import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartHandshake, Menu, X, PlusCircle, User, LogOut, LayoutDashboard, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === 'ROLE_ADMIN') return '/dashboard/admin';
    if (user.role === 'ROLE_DONOR') return '/dashboard/donor';
    return '/dashboard/requester';
  };

  const navLinks = [
    { label: 'Find Donors', path: '/donors' },
    { label: 'Blood Requests', path: '/requests' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-crimson-600 flex items-center justify-center text-white shadow-md shadow-crimson-600/20 group-hover:bg-crimson-700 transition-colors">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-crimson-600 transition-colors">
                Rakt<span className="text-crimson-600">Setu</span>
              </span>
              <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Emergency Blood Network
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-crimson-600 bg-crimson-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action CTAs & Auth Menu */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/requests/create">
              <Button size="sm" variant="primary" className="shadow-sm">
                <PlusCircle className="w-4 h-4" />
                <span>Request Blood</span>
              </Button>
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link to={getDashboardRoute()}>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <LayoutDashboard className="w-4 h-4 text-slate-500" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button size="sm" variant="ghost" className="px-2" title="User Profile">
                    <User className="w-4 h-4 text-slate-600" />
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={handleLogout} className="px-2 text-red-600 hover:text-red-700 hover:bg-red-50" title="Logout">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link to="/login">
                  <Button size="sm" variant="ghost">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" variant="secondary">
                    Register as Donor
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/requests/create">
              <Button size="sm" variant="primary">
                <PlusCircle className="w-4 h-4" />
              </Button>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive(link.path)
                  ? 'text-crimson-600 bg-crimson-50 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <Link
                  to={getDashboardRoute()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard ({user.fullName.split(' ')[0]})</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg"
                >
                  <User className="w-4 h-4" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Log In</Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
