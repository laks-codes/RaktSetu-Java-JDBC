import React from 'react';
import { Card } from '../components/common/Card';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How RaktSetu Works
        </h1>
        <p className="text-base text-slate-600">
          A transparent, step-by-step coordination workflow designed for emergency responders, hospital coordinators, and voluntary donors.
        </p>
      </div>

      <DisclaimerBanner compact />

      {/* Two Persona Tracks */}
      <div className="space-y-12">
        {/* Track 1: For Requesters */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-crimson-600 text-white flex items-center justify-center text-sm font-bold">A</span>
              <span>For People in Need of Blood (Requesters)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-crimson-50 text-crimson-600 flex items-center justify-center font-bold">1</div>
              <h4 className="font-bold text-slate-900">Post Emergency Request</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submit the patient's needed blood group, units, hospital address, required-by date, and emergency phone contact.
              </p>
            </Card>

            <Card className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-crimson-50 text-crimson-600 flex items-center justify-center font-bold">2</div>
              <h4 className="font-bold text-slate-900">Review Responses</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Volunteer donors will view your emergency broadcast and respond with their estimated arrival time at the hospital.
              </p>
            </Card>

            <Card className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-crimson-50 text-crimson-600 flex items-center justify-center font-bold">3</div>
              <h4 className="font-bold text-slate-900">Close the Request</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Once the units are collected and cross-matched at the hospital blood bank, mark the request as FULFILLED.
              </p>
            </Card>
          </div>
        </div>

        {/* Track 2: For Volunteer Donors */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-bold">B</span>
              <span>For Voluntary Blood Donors</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold">1</div>
              <h4 className="font-bold text-slate-900">Create Donor Profile</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Register with your blood group, broad neighborhood or city, and toggle your availability status to active.
              </p>
            </Card>

            <Card className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold">2</div>
              <h4 className="font-bold text-slate-900">Accept Request Invitations</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                View matching emergency posts in your city. If you are eligible and available to donate, accept the request with a note.
              </p>
            </Card>

            <Card className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold">3</div>
              <h4 className="font-bold text-slate-900">Hospital Screening</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Arrive at the hospital's certified blood bank. Undergo medical eligibility checks, hemoglobin check, and donation.
              </p>
            </Card>
          </div>
        </div>
      </div>

      <div className="text-center pt-6">
        <Link to="/register">
          <Button size="lg" variant="primary">
            Get Started on RaktSetu
          </Button>
        </Link>
      </div>
    </div>
  );
};
