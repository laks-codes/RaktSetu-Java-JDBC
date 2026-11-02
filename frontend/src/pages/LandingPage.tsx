import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  Clock, 
  Lock, 
  Users, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-16 pb-16">
      {/* Top compact disclaimer banner */}
      <DisclaimerBanner compact />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-crimson-50 border border-crimson-200 text-crimson-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-crimson-600 animate-ping" />
              Emergency Blood Coordination Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Every Drop Counts. <br className="hidden sm:inline" />
              <span className="text-crimson-600">Every Second Matters.</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              RaktSetu connects patients facing critical transfusions with verified voluntary donors across your city. Fast, transparent, and completely non-commercial.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link to="/requests/create" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full shadow-lg shadow-crimson-600/25">
                  <PlusCircle className="w-5 h-5" />
                  <span>Request Emergency Blood</span>
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full">
                  <HeartHandshake className="w-5 h-5 text-crimson-600" />
                  <span>Register as Donor</span>
                </Button>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Commercial Intermediaries</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-700" />
                <span>Donor Contact Privacy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-crimson-600" />
                <span>Real-Time Request Tracking</span>
              </div>
            </div>
          </div>

          {/* Hero Quick Search Card */}
          <div className="lg:col-span-5">
            <Card className="bg-gradient-to-br from-white to-slate-50 shadow-xl border-slate-200/90 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-crimson-500/5 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Find Immediate Blood Donors</h3>
              <p className="text-xs text-slate-500 mb-6">
                Locate voluntary donors in your district ready for emergency donation.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const bg = (form.elements.namedItem('bg') as HTMLSelectElement).value;
                  const city = (form.elements.namedItem('city') as HTMLInputElement).value;
                  const params = new URLSearchParams();
                  if (bg) params.set('bloodGroup', bg);
                  if (city) params.set('city', city);
                  navigate(`/donors?${params.toString()}`);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1.5">
                    Blood Group Needed
                  </label>
                  <select
                    name="bg"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600"
                  >
                    <option value="">Any Blood Group</option>
                    <option value="A+">A Positive (A+)</option>
                    <option value="A-">A Negative (A-)</option>
                    <option value="B+">B Positive (B+)</option>
                    <option value="B-">B Negative (B-)</option>
                    <option value="AB+">AB Positive (AB+)</option>
                    <option value="AB-">AB Negative (AB-)</option>
                    <option value="O+">O Positive (O+)</option>
                    <option value="O-">O Negative (O-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1.5">
                    City / Hospital Location
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Mumbai, Pune, Delhi"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full py-2.5">
                  <Search className="w-4 h-4" />
                  <span>Search Donors Near Me</span>
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Educational Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DisclaimerBanner />
      </div>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-crimson-600 mb-2">How It Works</h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Simple 3-Step Coordination</h3>
          <p className="text-slate-600 text-sm mt-2">
            Engineered for high stress situations where immediate coordination is essential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center space-y-4">
            <div className="w-12 h-12 bg-crimson-50 text-crimson-600 rounded-2xl flex items-center justify-center mx-auto text-lg font-black">
              1
            </div>
            <h4 className="text-lg font-bold text-slate-900">Post Emergency Request</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Provide the hospital name, required blood group, units, and emergency contact details.
            </p>
          </Card>

          <Card className="text-center space-y-4">
            <div className="w-12 h-12 bg-crimson-50 text-crimson-600 rounded-2xl flex items-center justify-center mx-auto text-lg font-black">
              2
            </div>
            <h4 className="text-lg font-bold text-slate-900">Donors Receive Alert</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Available volunteer donors with matching blood groups in the same city are alerted immediately.
            </p>
          </Card>

          <Card className="text-center space-y-4">
            <div className="w-12 h-12 bg-crimson-50 text-crimson-600 rounded-2xl flex items-center justify-center mx-auto text-lg font-black">
              3
            </div>
            <h4 className="text-lg font-bold text-slate-900">Direct Coordination</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Donors confirm estimated arrival time and coordinate directly with the patient’s representative at the hospital.
            </p>
          </Card>
        </div>
      </section>

      {/* Feature / Trust Cards */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-crimson-600 shrink-0 shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Privacy by Design</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Voluntary donors are in control. Personal phone numbers and addresses are strictly concealed from public scrapers and spam bots.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-crimson-600 shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Verified Audit Trail</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All requests and donor responses are monitored with immutable audit logging to curb misuse and false emergencies.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-crimson-600 shrink-0 shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Voluntary Network</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  100% free, community-driven platform built by engineering students to foster compassionate blood donation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Card className="bg-crimson-900 text-white p-8 sm:p-12 space-y-6">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to Be Someone's Lifesaver?
          </h3>
          <p className="text-crimson-100 max-w-xl mx-auto text-sm leading-relaxed">
            Register as a voluntary donor today. You can set your availability and only receive notifications when someone in your city urgently needs your blood group.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-crimson-900 hover:bg-slate-100 font-bold">
                Join Volunteer Register
              </Button>
            </Link>
            <Link to="/requests">
              <Button size="lg" variant="ghost" className="text-white hover:bg-crimson-800">
                Browse Active Requests <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
};
