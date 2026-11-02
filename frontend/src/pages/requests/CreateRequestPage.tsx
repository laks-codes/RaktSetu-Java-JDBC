import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { BloodGroup, UrgencyLevel } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Alert } from '../../components/common/Alert';
import { DisclaimerBanner } from '../../components/common/DisclaimerBanner';
import { PlusCircle, ArrowLeft, AlertCircle, Building2, Calendar, Phone } from 'lucide-react';

export const CreateRequestPage: React.FC = () => {
  const navigate = useNavigate();

  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [unitsRequested, setUnitsRequested] = useState<number>(1);
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('URGENT');
  const [requiredBy, setRequiredBy] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!requiredBy) {
      setError('Please select the required-by date and time.');
      return;
    }

    const requiredDate = new Date(requiredBy);
    if (requiredDate <= new Date()) {
      setError('Required-by date and time must be in the future.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await requestService.createRequest({
        patientName,
        bloodGroup,
        unitsRequested: Number(unitsRequested),
        hospitalName,
        hospitalAddress,
        city,
        area,
        urgency,
        requiredBy: requiredDate.toISOString(),
        contactPhone,
        notes,
      });

      navigate(`/requests/${response.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create blood request. Please check required fields.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const bloodGroupOptions = [
    { value: 'A+', label: 'A Positive (A+)' },
    { value: 'A-', label: 'A Negative (A-)' },
    { value: 'B+', label: 'B Positive (B+)' },
    { value: 'B-', label: 'B Negative (B-)' },
    { value: 'AB+', label: 'AB Positive (AB+)' },
    { value: 'AB-', label: 'AB Negative (AB-)' },
    { value: 'O+', label: 'O Positive (O+)' },
    { value: 'O-', label: 'O Negative (O-)' },
  ];

  const urgencyOptions = [
    { value: 'CRITICAL', label: 'CRITICAL — Needed within 12 hours (Emergency/Surgery)' },
    { value: 'URGENT', label: 'URGENT — Needed within 24–48 hours' },
    { value: 'NORMAL', label: 'NORMAL — Scheduled procedure or regular transfusion' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link to="/requests">
        <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
          <ArrowLeft className="w-4 h-4" /> Back to All Requests
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Post Emergency Blood Request</h1>
        <p className="text-sm text-slate-500 mt-1">
          Broadcast your urgent transfusion requirement to voluntary donors in your city
        </p>
      </div>

      <DisclaimerBanner compact />

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="shadow-lg border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              1. Patient & Requirement
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <Select
                  label="Blood Group Needed"
                  options={bloodGroupOptions}
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  required
                />
              </div>

              <div className="sm:col-span-1">
                <Input
                  label="Units Required"
                  type="number"
                  min="1"
                  max="10"
                  value={unitsRequested}
                  onChange={(e) => setUnitsRequested(Number(e.target.value))}
                  required
                />
              </div>

              <div className="sm:col-span-1">
                <Input
                  label="Patient Identifier / Name"
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Aarav P."
                  required
                />
              </div>
            </div>

            <Select
              label="Urgency Level"
              options={urgencyOptions}
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
              required
            />
          </div>

          {/* Hospital & Location */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              2. Hospital & Location
            </h3>

            <Input
              label="Hospital / Blood Bank Name"
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="e.g. Lilavati Hospital & Research Centre"
              required
            />

            <Input
              label="Hospital Address / Landmark"
              type="text"
              value={hospitalAddress}
              onChange={(e) => setHospitalAddress(e.target.value)}
              placeholder="e.g. Bandra Reclamation, Bandra West"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City / District"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                required
              />

              <Input
                label="Area / Suburb"
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Bandra"
              />
            </div>
          </div>

          {/* Timing & Contact */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              3. Timing & Emergency Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Required By (Date & Time)"
                type="datetime-local"
                value={requiredBy}
                onChange={(e) => setRequiredBy(e.target.value)}
                required
              />

              <Input
                label="Emergency Contact Phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+919876543210"
                helperText="Direct line for responding donors to call"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Clinical Context / Special Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Surgery scheduled for tomorrow morning. Donor can report directly to 2nd floor blood bank."
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
              <PlusCircle className="w-5 h-5" />
              <span>Broadcast Blood Request</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
