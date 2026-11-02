import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Alert } from '../../components/common/Alert';
import { BloodGroup, Role } from '../../types';
import { HeartHandshake, UserPlus, Heart, Users } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>('ROLE_DONOR');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register({
        email,
        password,
        fullName,
        phoneNumber,
        city,
        role,
        bloodGroup: role === 'ROLE_DONOR' ? bloodGroup : undefined,
      });

      if (role === 'ROLE_DONOR') {
        navigate('/dashboard/donor');
      } else {
        navigate('/dashboard/requester');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Please check your details.');
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

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-crimson-600 text-white shadow-md shadow-crimson-600/30">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Join the RaktSetu Network
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Register as a voluntary donor or create a requester account for emergencies
          </p>
        </div>

        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card className="shadow-lg border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('ROLE_DONOR')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    role === 'ROLE_DONOR'
                      ? 'border-crimson-600 bg-crimson-50/70 text-crimson-950 ring-2 ring-crimson-600/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Heart className={`w-5 h-5 shrink-0 mt-0.5 ${role === 'ROLE_DONOR' ? 'text-crimson-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-bold text-sm">Blood Donor</div>
                    <div className="text-xs text-slate-500">I want to voluntarily donate</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('ROLE_REQUESTER')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    role === 'ROLE_REQUESTER'
                      ? 'border-crimson-600 bg-crimson-50/70 text-crimson-950 ring-2 ring-crimson-600/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Users className={`w-5 h-5 shrink-0 mt-0.5 ${role === 'ROLE_REQUESTER' ? 'text-crimson-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-bold text-sm">Requester</div>
                    <div className="text-xs text-slate-500">I need blood for patients</div>
                  </div>
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+919876543210"
                helperText="Kept private from public search"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City / District"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                required
              />

              {role === 'ROLE_DONOR' ? (
                <Select
                  label="Blood Group"
                  options={bloodGroupOptions}
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  required
                />
              ) : (
                <div />
              )}
            </div>

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
            />

            <Button type="submit" variant="primary" className="w-full py-2.5 mt-2" isLoading={isLoading}>
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-crimson-600 hover:text-crimson-700">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};
