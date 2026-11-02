import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { BloodGroup, UrgencyLevel } from '../../types';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';

const bloodGroups = [
  { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
];
const urgencyLevels = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'NORMAL', label: 'Normal' },
];

export const CreateRequestPage: React.FC = () => {
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [unitsRequested, setUnitsRequested] = useState(1);
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('URGENT');
  const [requiredBy, setRequiredBy] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!requiredBy || new Date(requiredBy) <= new Date()) {
      setError('Choose a required-by time in the future.');
      return;
    }

    setLoading(true);
    try {
      await requestService.createRequest({
        patientName,
        bloodGroup,
        unitsRequested,
        hospitalName,
        hospitalAddress,
        city,
        area,
        urgency,
        requiredBy: new Date(requiredBy).toISOString(),
        contactPhone,
        notes,
      });
      setSubmitted(true);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not submit the blood request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Request blood</h1>
      <p className="mt-2 text-slate-600">Enter the patient and hospital details so the request can be followed up.</p>

      {error && <Alert type="error" className="mt-6">{error}</Alert>}
      {submitted && (
        <Alert type="success" title="Request submitted" className="mt-6">
          Your blood request has been saved. You can also <Link className="underline font-semibold" to="/donors">search for a donor</Link> now.
        </Alert>
      )}

      {!submitted && (
        <Card className="mt-6 p-5 sm:p-7">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Patient name or identifier" value={patientName} onChange={(e) => setPatientName(e.target.value)} required />
              <Select label="Blood group needed" options={bloodGroups} value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)} required />
              <Input label="Units needed" type="number" min="1" value={unitsRequested}
                onChange={(e) => setUnitsRequested(Number(e.target.value))} required />
              <Select label="Urgency" options={urgencyLevels} value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)} required />
              <Input label="Hospital or blood bank" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} required />
              <Input label="Hospital address (optional)" value={hospitalAddress} onChange={(e) => setHospitalAddress(e.target.value)} />
              <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
              <Input label="Area (optional)" value={area} onChange={(e) => setArea(e.target.value)} />
              <Input label="Required by" type="datetime-local" value={requiredBy}
                onChange={(e) => setRequiredBy(e.target.value)} required />
              <Input label="Contact phone" type="tel" value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-crimson-500 focus:outline-none focus:ring-2 focus:ring-crimson-200" />
            </div>
            <Button type="submit" variant="primary" className="w-full" isLoading={loading}>Submit blood request</Button>
          </form>
        </Card>
      )}
    </main>
  );
};
