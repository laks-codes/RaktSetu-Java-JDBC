import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { BloodGroup, BloodRequest, RequestStatus, UrgencyLevel } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { CardSkeleton } from '../../components/common/Skeleton';
import { DisclaimerBanner } from '../../components/common/DisclaimerBanner';
import { 
  PlusCircle, 
  Search, 
  MapPin, 
  Building2, 
  Clock, 
  ArrowRight, 
  Filter, 
  AlertCircle 
} from 'lucide-react';

export const RequestListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [bloodGroup, setBloodGroup] = useState<string>(searchParams.get('bloodGroup') || '');
  const [city, setCity] = useState<string>(searchParams.get('city') || '');
  const [status, setStatus] = useState<string>(searchParams.get('status') || 'OPEN');
  const [urgency, setUrgency] = useState<string>(searchParams.get('urgency') || '');

  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [totalRequests, setTotalRequests] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await requestService.searchRequests({
        bloodGroup: bloodGroup as BloodGroup | '',
        city,
        status: status as RequestStatus | '',
        urgency: urgency as UrgencyLevel | '',
      });
      setRequests(response.content);
      setTotalRequests(response.totalElements);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch blood requests.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [searchParams]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (bloodGroup) params.bloodGroup = bloodGroup;
    if (city) params.city = city;
    if (status) params.status = status;
    if (urgency) params.urgency = urgency;
    setSearchParams(params);
  };

  const resetFilters = () => {
    setBloodGroup('');
    setCity('');
    setStatus('OPEN');
    setUrgency('');
    setSearchParams({ status: 'OPEN' });
  };

  const bloodGroupOptions = [
    { value: '', label: 'All Blood Groups' },
    { value: 'A+', label: 'A Positive (A+)' },
    { value: 'A-', label: 'A Negative (A-)' },
    { value: 'B+', label: 'B Positive (B+)' },
    { value: 'B-', label: 'B Negative (B-)' },
    { value: 'AB+', label: 'AB Positive (AB+)' },
    { value: 'AB-', label: 'AB Negative (AB-)' },
    { value: 'O+', label: 'O Positive (O+)' },
    { value: 'O-', label: 'O Negative (O-)' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'OPEN', label: 'Open Requests' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'FULFILLED', label: 'Fulfilled' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const urgencyOptions = [
    { value: '', label: 'All Urgencies' },
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'URGENT', label: 'Urgent' },
    { value: 'NORMAL', label: 'Normal' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Emergency Blood Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Active patient transfusion requirements requiring voluntary donor response
          </p>
        </div>
        <Link to="/requests/create">
          <Button variant="primary" className="shadow-sm">
            <PlusCircle className="w-4 h-4" />
            <span>Post New Request</span>
          </Button>
        </Link>
      </div>

      <DisclaimerBanner compact />

      {/* Filter Card */}
      <Card className="bg-white shadow-sm border-slate-200">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <Select
            label="Blood Group"
            options={bloodGroupOptions}
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
          />

          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai"
          />

          <Select
            label="Urgency"
            options={urgencyOptions}
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          />

          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />

          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
            <Button type="button" variant="outline" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : requests.length === 0 ? (
        <Card className="text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Blood Requests Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            No blood requests matched your filter parameters. Try clearing filters or creating a new request.
          </p>
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Showing {requests.length} of {totalRequests} emergency requests
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <Card key={req.id} hoverEffect className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="blood" size="md">
                      {req.bloodGroup} Needed
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="urgency" urgency={req.urgency} size="sm">
                        {req.urgency}
                      </Badge>
                      <Badge variant="status" status={req.status} size="sm">
                        {req.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      {req.unitsRequested} {req.unitsRequested === 1 ? 'Unit' : 'Units'} for {req.patientName}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{req.hospitalName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{req.city}{req.area ? `, ${req.area}` : ''}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>By {new Date(req.requiredBy).toLocaleDateString()}</span>
                    </div>
                    <span className="font-medium text-crimson-600">
                      {req.responseCount} {req.responseCount === 1 ? 'response' : 'responses'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to={`/requests/${req.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      <span>View & Respond</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
