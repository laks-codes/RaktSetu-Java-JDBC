import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { donorService } from '../../services/donorService';
import { requestService } from '../../services/requestService';
import { BloodRequest, DonorProfile, DonorResponse } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { CardSkeleton } from '../../components/common/Skeleton';
import { 
  Heart, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Clock, 
  Eye, 
  Settings,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [matchingRequests, setMatchingRequests] = useState<BloodRequest[]>([]);
  const [myResponses, setMyResponses] = useState<DonorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTogglingAvail, setIsTogglingAvail] = useState(false);

  const fetchDonorData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const prof = await donorService.getMyDonorProfile();
      setProfile(prof);

      // Fetch matching requests for donor's blood group and city
      const matched = await requestService.searchRequests({
        bloodGroup: prof.bloodGroup,
        city: prof.city,
        status: 'OPEN',
      });
      setMatchingRequests(matched.content);

      // Fetch donor's responses
      const resps = await requestService.getMyResponses();
      setMyResponses(resps);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load donor data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
  }, []);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    setIsTogglingAvail(true);
    try {
      const updated = await donorService.updateAvailability(profile.id, !profile.isAvailable);
      setProfile(updated);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsTogglingAvail(false);
    }
  };

  return (
    <DashboardLayout
      title="Donor Dashboard"
      subtitle="Manage your voluntary donation preferences and review matching blood requests"
      actionButton={
        <Link to="/profile">
          <Button variant="outline">
            <Settings className="w-4 h-4" />
            <span>Profile Settings</span>
          </Button>
        </Link>
      }
    >
      <div className="space-y-8">
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Profile Card & Availability Toggle */}
        {profile && (
          <Card className="bg-gradient-to-r from-crimson-900 to-slate-900 text-white p-6 sm:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-white text-crimson-900 rounded-full font-black text-sm">
                    {profile.bloodGroup}
                  </span>
                  <span className="text-crimson-200 text-xs font-semibold uppercase tracking-wider">
                    Registered Voluntary Donor
                  </span>
                </div>
                <h2 className="text-2xl font-black">{profile.fullName}</h2>
                <div className="flex items-center gap-1.5 text-xs text-crimson-100">
                  <MapPin className="w-4 h-4 text-crimson-300" />
                  <span>{profile.city}{profile.area ? `, ${profile.area}` : ''}</span>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-3">
                <div className="text-xs text-slate-300 font-medium">Availability Status:</div>
                <Button
                  size="md"
                  onClick={handleToggleAvailability}
                  isLoading={isTogglingAvail}
                  className={profile.isAvailable ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-700 hover:bg-slate-800 text-white'}
                >
                  {profile.isAvailable ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Available to Donate</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Unavailable (Paused)</span>
                    </>
                  )}
                </Button>
                <span className="text-[11px] text-slate-300">Click to toggle your live availability</span>
              </div>
            </div>
          </Card>
        )}

        {/* Matching Requests Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-crimson-600" />
              <span>Emergency Requests Matching Your Blood Group ({matchingRequests.length})</span>
            </h3>
            <Link to="/requests" className="text-xs font-semibold text-crimson-600 hover:underline">
              View all requests
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : matchingRequests.length === 0 ? (
            <Card className="text-center py-10 text-slate-500 text-sm">
              No open requests currently matching your blood group in {profile?.city}. You will be notified when someone needs your help!
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchingRequests.map((req) => (
                <Card key={req.id} hoverEffect className="flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="blood" size="sm">{req.bloodGroup} Needed</Badge>
                      <Badge variant="urgency" urgency={req.urgency} size="sm">{req.urgency}</Badge>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base">
                      {req.unitsRequested} {req.unitsRequested === 1 ? 'Unit' : 'Units'} for {req.patientName}
                    </h4>

                    <div className="text-xs text-slate-500 space-y-0.5">
                      <div>{req.hospitalName}</div>
                      <div>Required by: {new Date(req.requiredBy).toLocaleString()}</div>
                    </div>
                  </div>

                  <Link to={`/requests/${req.id}`}>
                    <Button variant="primary" size="sm" className="w-full justify-between">
                      <span>View & Respond</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Responses by Donor */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">My Response History ({myResponses.length})</h3>

          {myResponses.length === 0 ? (
            <Card className="text-center py-8 text-slate-500 text-sm">
              You haven't responded to any requests yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {myResponses.map((resp) => (
                <Card key={resp.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success" size="sm">{resp.status}</Badge>
                      <span className="text-xs text-slate-400">
                        Responded {new Date(resp.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {resp.message && (
                      <p className="text-xs text-slate-600 mt-1 italic">"{resp.message}"</p>
                    )}
                  </div>

                  <Link to={`/requests/${resp.requestId}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                      <span>View Request</span>
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
