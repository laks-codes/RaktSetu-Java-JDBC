import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { donorService } from '../../services/donorService';
import { DonorProfile } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { DisclaimerBanner } from '../../components/common/DisclaimerBanner';
import { useAuth } from '../../hooks/useAuth';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle 
} from 'lucide-react';

export const DonorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  const [donor, setDonor] = useState<DonorProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDonor = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await donorService.getDonorById(Number(id));
      setDonor(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load donor profile.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonor();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !donor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        <Link to="/donors">
          <Button variant="ghost" size="sm" className="gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Donors
          </Button>
        </Link>
        <Alert type="error">{error || 'Donor profile not found'}</Alert>
        <Button variant="primary" size="sm" onClick={fetchDonor}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link to="/donors">
        <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
          <ArrowLeft className="w-4 h-4" /> Back to Donor Directory
        </Button>
      </Link>

      <DisclaimerBanner compact />

      {/* Main Donor Card */}
      <Card className="shadow-md border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{donor.fullName}</h1>
              <Badge variant="blood" size="md">
                {donor.bloodGroup}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{donor.city}{donor.area ? `, ${donor.area}` : ''}</span>
            </div>
          </div>

          <div>
            {donor.isAvailable ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Available for Donation
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                <XCircle className="w-4 h-4 text-slate-500" />
                Currently Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-100">
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contact Coordinates</h4>
            
            <div className="flex items-center gap-3 text-sm text-slate-800">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{donor.phoneNumber || 'Not provided'}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-800">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{donor.email || 'Not provided'}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Donor has granted consent for emergency contact</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Donation History</h4>

            <div className="flex items-center gap-3 text-sm text-slate-800">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                Last Donation:{' '}
                <strong>{donor.lastDonationDate || 'First time donor'}</strong>
              </span>
            </div>

            <div className="text-sm text-slate-800">
              Total Voluntary Donations: <strong>{donor.totalDonations}</strong>
            </div>

            {donor.notes && (
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200/60">
                <strong>Donor Note:</strong> {donor.notes}
              </div>
            )}
          </div>
        </div>

        {/* Safety Note */}
        <div className="pt-6 flex items-start gap-3 text-xs text-slate-500">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p>
            Please respect the donor's time and coordinate strictly for verified hospital needs. Do not ask for or offer financial compensation.
          </p>
        </div>
      </Card>
    </div>
  );
};
