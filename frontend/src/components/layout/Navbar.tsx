import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-slate-900">
          <HeartHandshake className="w-7 h-7 text-crimson-600" />
          Rakt<span className="text-crimson-600">Setu</span>
        </Link>

        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/donors" className="hidden sm:block px-3 py-2 text-sm text-slate-700 hover:text-crimson-700">
                Find a donor
              </Link>
              <Link to="/requests/create" className="hidden sm:block px-3 py-2 text-sm text-slate-700 hover:text-crimson-700">
                Request blood
              </Link>
              <span className="hidden md:block text-sm text-slate-500">{user?.fullName}</span>
              <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sign out">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link to="/register"><Button variant="primary" size="sm">Create account</Button></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
