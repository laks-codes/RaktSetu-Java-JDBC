import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { donorService } from '../../services/donorService';
import { BloodGroup, DonorPublic } from '../../types';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';

const bloodGroups = [
  { value: '', label: 'Any blood group' },
  { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
];

export const DonorSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const bloodGroup = (searchParams.get('bloodGroup') || '') as BloodGroup | '';
  const city = searchParams.get('city') || '';
  const [bloodInput, setBloodInput] = useState(bloodGroup);
  const [cityInput, setCityInput] = useState(city);
  const [donors, setDonors] = useState<DonorPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setBloodInput(bloodGroup);
    setCityInput(city);
    setLoading(true);
    setError('');

    donorService.searchDonors({ bloodGroup, city }).then((result) => {
      setDonors(result.content);
    }).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : 'Could not load donors.');
    }).finally(() => setLoading(false));
  }, [bloodGroup, city]);

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams();
    if (bloodInput) next.set('bloodGroup', bloodInput);
    if (cityInput.trim()) next.set('city', cityInput.trim());
    setSearchParams(next);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Find an available donor</h1>
      <p className="mt-2 text-slate-600">Search by blood group and city. Donor contact details appear only when they opted in.</p>

      <Card className="mt-6 p-5">
        <form onSubmit={search} className="grid sm:grid-cols-3 gap-4 items-end">
          <Select label="Blood group" options={bloodGroups} value={bloodInput}
            onChange={(event) => setBloodInput(event.target.value as BloodGroup | '')} />
          <Input label="City" value={cityInput} onChange={(event) => setCityInput(event.target.value)} placeholder="e.g. Chennai" />
          <Button type="submit" variant="primary">Search donors</Button>
        </form>
      </Card>

      {error && <Alert type="error" className="mt-6">{error}</Alert>}
      {loading && <p className="mt-8 text-slate-500">Loading donors…</p>}
      {!loading && !error && donors.length === 0 && (
        <Card className="mt-6 p-6 text-slate-600">No available donors match those details.</Card>
      )}

      {!loading && donors.length > 0 && (
        <section className="mt-6 grid sm:grid-cols-2 gap-4">
          {donors.map((donor) => (
            <Card key={donor.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-lg text-slate-900">{donor.displayName}</h2>
                  <p className="text-sm text-slate-600">{donor.city}{donor.area ? `, ${donor.area}` : ''}</p>
                </div>
                <span className="rounded-full bg-red-50 px-3 py-1 font-bold text-crimson-700">{donor.bloodGroup}</span>
              </div>
              <p className="mt-3 text-sm text-emerald-700">Available</p>
              {donor.consentToContact ? (
                <div className="mt-3 space-y-1 text-sm">
                  {donor.phoneNumber && <p><a className="text-crimson-700 underline" href={`tel:${donor.phoneNumber}`}>{donor.phoneNumber}</a></p>}
                  {donor.email && <p><a className="text-crimson-700 underline" href={`mailto:${donor.email}`}>{donor.email}</a></p>}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">This donor has not shared contact details.</p>
              )}
            </Card>
          ))}
        </section>
      )}
    </main>
  );
};
