import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Search, Droplets } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const LandingPage: React.FC = () => (
  <main className="max-w-5xl mx-auto px-4 py-14 sm:py-20">
    <section className="text-center max-w-3xl mx-auto">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-crimson-600 text-white">
        <HeartHandshake className="w-8 h-8" />
      </div>
      <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold text-slate-900">
        Find blood help, simply.
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Request blood for a patient or find an available donor near you.
      </p>
    </section>

    <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
      <Card className="p-6">
        <Droplets className="w-8 h-8 text-crimson-600" />
        <h2 className="mt-4 text-xl font-bold text-slate-900">Request blood</h2>
        <p className="mt-2 text-sm text-slate-600">Share the patient, hospital, blood group, and contact details.</p>
        <Link to="/requests/create" className="block mt-5">
          <Button variant="primary" className="w-full">Create a request</Button>
        </Link>
      </Card>

      <Card className="p-6">
        <Search className="w-8 h-8 text-crimson-600" />
        <h2 className="mt-4 text-xl font-bold text-slate-900">Find a donor</h2>
        <p className="mt-2 text-sm text-slate-600">Search available donors by blood group and city.</p>
        <Link to="/donors" className="block mt-5">
          <Button variant="outline" className="w-full">Search donors</Button>
        </Link>
      </Card>
    </section>

    <p className="mt-8 text-center text-sm text-slate-500">
      Sign in to use either service. Donors can register with their blood group and choose whether to share contact details.
    </p>
  </main>
);
