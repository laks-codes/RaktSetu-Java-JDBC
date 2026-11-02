import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { AlertCircle, Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-crimson-50 text-crimson-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
          <p className="text-sm text-slate-500">
            The page you requested could not be located. It may have been moved or the emergency request may have expired.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link to="/">
            <Button variant="primary">
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Button>
          </Link>
          <Link to="/donors">
            <Button variant="outline">
              <Search className="w-4 h-4" />
              <span>Find Donors</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
