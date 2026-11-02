import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { donorService } from '../services/donorService';
import { DonorProfile } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import { User, ShieldCheck, Heart, MapPin, Phone, Mail } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form editable fields for donor
  const [area, setArea] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [consentToContact, setConsentToContact] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const loadDonorProfile = async () => {
      if (user && user.role === 'ROLE_DONOR') {
        setIsLoading(true);
        try {
          const profile = await donorService.getMyDonorProfile();
          setDonorProfile(profile);
          setArea(profile.area || '');
          setIsAvailable(profile.isAvailable);
          setConsentToContact(profile.consentToContact);
          setNotes(profile.notes || '');
        } catch {
          // May not have completed profile yet
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadDonorProfile();
  }, [user]);

  const handleUpdateDonorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorProfile) return;
    setIsLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const updated = await donorService.updateDonorProfile(donorProfile.id, {
        area,
        isAvailable,
        consentToContact,
        notes,
      });
      setDonorProfile(updated);
      setSuccess('Donor preferences updated successfully!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your identity, role permissions, and privacy consent</p>
      </div>

      {success && (
        <Alert type="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Basic Account Info */}
      <Card className="shadow-sm border-slate-200 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-crimson-50 text-crimson-600 flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{user.fullName}</h2>
              <Badge variant="neutral" size="sm">
                {user.role}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Account ID #{user.id} • Registered {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</div>
            <div className="flex items-center gap-2 font-medium text-slate-900">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user.email}</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone Number</div>
            <div className="flex items-center gap-2 font-medium text-slate-900">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{user.phoneNumber || 'Not provided'}</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">City Location</div>
            <div className="flex items-center gap-2 font-medium text-slate-900">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{user.city}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Donor Preferences (If User is Donor) */}
      {donorProfile && (
        <Card className="shadow-sm border-slate-200 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-crimson-600" />
              <h3 className="text-lg font-bold text-slate-900">Donor Preferences & Availability</h3>
            </div>
            <Badge variant="blood" size="md">
              {donorProfile.bloodGroup}
            </Badge>
          </div>

          <form onSubmit={handleUpdateDonorProfile} className="space-y-4">
            <Input
              label="Area / Neighborhood / Suburb"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Andheri West, Kothrud"
            />

            <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <input
                  id="availCheck"
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 text-crimson-600 rounded border-slate-300 focus:ring-crimson-500"
                />
                <label htmlFor="availCheck" className="text-sm font-semibold text-slate-800 cursor-pointer">
                  I am currently available to be contacted for emergency donations
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="consentCheck"
                  type="checkbox"
                  checked={consentToContact}
                  onChange={(e) => setConsentToContact(e.target.checked)}
                  className="w-4 h-4 text-crimson-600 rounded border-slate-300 focus:ring-crimson-500"
                />
                <label htmlFor="consentCheck" className="text-sm font-semibold text-slate-800 cursor-pointer">
                  Consent to share phone number with verified emergency requesters
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Availability Notes (e.g. preferred hours, workplace proximity)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Available on weekday evenings after 6 PM"
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600"
              />
            </div>

            <Button type="submit" variant="primary" isLoading={isLoading}>
              Save Preferences
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
