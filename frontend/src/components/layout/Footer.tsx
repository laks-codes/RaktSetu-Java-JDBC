import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Shield, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-crimson-600 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Rakt<span className="text-crimson-500">Setu</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              Emergency blood donor search and request network bridging volunteers and patients facing urgent transfusion requirements.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Educational Software Engineering Project</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/donors" className="hover:text-white transition-colors">Find Blood Donors</Link>
              </li>
              <li>
                <Link to="/requests" className="hover:text-white transition-colors">Emergency Requests</Link>
              </li>
              <li>
                <Link to="/requests/create" className="hover:text-white transition-colors">Post Blood Request</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Register as Volunteer</Link>
              </li>
            </ul>
          </div>

          {/* Learn & Safety */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Information</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">How RaktSetu Works</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About the Project</Link>
              </li>
              <li>
                <a 
                  href="https://www.who.int/campaigns/world-blood-donor-day" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>WHO Blood Safety</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Privacy & Legal disclaimer */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Clinical Disclaimer</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              RaktSetu does not provide medical services, disease screening, or transfusion compatibility certification. All clinical cross-matching must be authorized by licensed healthcare facilities.
            </p>
            <p className="text-xs text-slate-500">
              Donor privacy is protected by design. Private contact numbers are never indexed in public search engines.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} RaktSetu. Built for academic & educational demonstration.</p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-crimson-500 fill-crimson-500" /> for voluntary community donors
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
