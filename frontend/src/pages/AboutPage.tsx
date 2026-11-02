import React from 'react';
import { Card } from '../components/common/Card';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { ShieldCheck, Heart, Award, HelpCircle } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About RaktSetu
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          RaktSetu ("Blood Bridge") was conceived as an academic full-stack software engineering project designed to eliminate latency in voluntary blood donor discovery during critical healthcare emergencies.
        </p>
      </div>

      <DisclaimerBanner />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="space-y-4">
          <div className="w-10 h-10 rounded-xl bg-crimson-50 text-crimson-600 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Project Mission</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            In medical emergencies, families often scramble across messaging groups and social media channels to locate compatible voluntary blood donors. RaktSetu streamlines this process by providing structured search, verifiable urgency tags, and consent-driven donor communication.
          </p>
        </Card>

        <Card className="space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Privacy & Ethics First</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Unlike public broadcast forums, RaktSetu does not publish donor phone numbers to web indexers. Donors retain absolute control over their availability toggles and consent options at all times.
          </p>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-crimson-600" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-4">
          <Card>
            <h4 className="font-bold text-slate-900 mb-2">Is RaktSetu a blood bank or clinical laboratory?</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              No. RaktSetu is strictly a digital coordination layer. We do not collect, test, or store physical blood. All blood donation and transfusion procedures must occur at authorized blood transfusion centers or hospitals.
            </p>
          </Card>

          <Card>
            <h4 className="font-bold text-slate-900 mb-2">Does finding a donor here guarantee biological compatibility?</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              No. Blood group matching (such as O+ to O+) is only an initial indicator. Hospital laboratories must perform cross-matching, antibody screening, and donor health checks before any transfusion takes place.
            </p>
          </Card>

          <Card>
            <h4 className="font-bold text-slate-900 mb-2">Can someone charge money for blood donation through RaktSetu?</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Commercial sale or purchase of human blood is strictly illegal. RaktSetu supports only 100% unpaid voluntary donation. Accounts demanding commercial remuneration will be suspended immediately.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
