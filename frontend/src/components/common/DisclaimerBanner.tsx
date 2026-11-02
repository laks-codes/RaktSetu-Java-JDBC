import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-slate-100 border-b border-slate-200 py-1.5 px-4 text-center text-xs text-slate-600 flex items-center justify-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        <span>
          <strong>Educational Project:</strong> RaktSetu does not certify clinical donor compatibility or transfusion suitability. Crossmatching must be performed by certified blood banks.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 my-6 text-amber-900 text-sm flex items-start gap-3 shadow-xs">
      <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="leading-relaxed">
        <h5 className="font-bold text-amber-950 mb-0.5">Educational Project & Non-Clinical Disclaimer</h5>
        <p className="text-amber-900/90 text-xs sm:text-sm">
          RaktSetu is an educational platform designed to coordinate voluntary blood donor contacts during emergencies. 
          <strong> It does not claim to medically certify donor compatibility, donor eligibility, infectious disease status, or transfusion suitability.</strong> 
          Transfusion safety tests, serological screening, and biological cross-matching must always be performed by licensed medical institutions and certified blood banks.
        </p>
      </div>
    </div>
  );
};
