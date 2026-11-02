import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { donorService, DonorSearchParams } from '../../services/donorService';
import { BloodGroup, DonorPublic } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { CardSkeleton } from '../../components/common/Skeleton';
import { DisclaimerBanner } from '../../components/common/DisclaimerBanner';
import {
  Search,
  MapPin,
  Shield,
  CheckCircle,
  XCircle,
  ArrowRight,
  Filter,
  RefreshCw,
  Clock,
  AlertTriangle
} from 'lucide-react';

export const DonorSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-driven query parameters
  const urlBloodGroup = (searchParams.get('bloodGroup') || '') as BloodGroup | '';
  const urlCity = searchParams.get('city') || '';
  const urlAvailableOnly = searchParams.get('availableOnly') !== 'false';

  // Form input controls
  const [bloodGroup, setBloodGroup] = useState<string>(urlBloodGroup);
  const [city, setCity] = useState<string>(urlCity);
  const [availableOnly, setAvailableOnly] = useState<boolean>(urlAvailableOnly);

  // Data states
  const [donors, setDonors] = useState<DonorPublic[]>([]);
  const [totalDonors, setTotalDonors] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [showSlowNotice, setShowSlowNotice] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync inputs with URL params
  useEffect(() => {
    setBloodGroup(urlBloodGroup);
    setCity(urlCity);
    setAvailableOnly(urlAvailableOnly);
  }, [urlBloodGroup, urlCity, urlAvailableOnly]);

  // Notice timer for cold-starts (> 3.5s)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (isLoading) {
      timer = setTimeout(() => {
        setShowSlowNotice(true);
      }, 3500);
    } else {
      setShowSlowNotice(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  // Fetch donors with SWR cache + AbortSignal
  const performFetch = async (bypassCache = false, signal?: AbortSignal) => {
    const params: DonorSearchParams = {
      bloodGroup: urlBloodGroup,
      city: urlCity,
      availableOnly: urlAvailableOnly,
    };

    // 1. SWR: Check cache first for instant display
    const cached = !bypassCache ? donorService.getCachedDonors(params) : null;
    if (cached) {
      setDonors(cached.content);
      setTotalDonors(cached.totalElements);
      setIsLoading(false);
      setIsRevalidating(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await donorService.searchDonors(params, { signal, bypassCache });
      setDonors(response.content);
      setTotalDonors(response.totalElements);
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'AbortError') {
        // Safe cancellation on re-render / tab switch
        return;
      }
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch donors. Please check connection.');
      }
    } finally {
      setIsLoading(false);
      setIsRevalidating(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    performFetch(false, controller.signal);

    return () => {
      controller.abort();
    };
  }, [urlBloodGroup, urlCity, urlAvailableOnly]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (bloodGroup) params.bloodGroup = bloodGroup;
    if (city.trim()) params.city = city.trim();
    if (!availableOnly) params.availableOnly = 'false';
    setSearchParams(params);
  };

  const resetFilters = () => {
    setBloodGroup('');
    setCity('');
    setAvailableOnly(true);
    setSearchParams({});
  };

  const handleRetry = () => {
    performFetch(true);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Voluntary Blood Donors</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse verified community members ready to assist in emergency transfusions
          </p>
        </div>
        <Link to="/requests/create">
          <Button variant="primary">Post Emergency Request</Button>
        </Link>
      </div>

      <DisclaimerBanner compact />

      {/* Filter Bar */}
      <Card className="bg-white shadow-sm border-slate-200">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <Select
            label="Blood Group"
            options={bloodGroupOptions}
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
          />

          <Input
            label="City / District"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai, Pune, Delhi"
          />

          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <input
              id="availOnly"
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 text-crimson-600 rounded border-slate-300 focus:ring-crimson-500"
            />
            <label htmlFor="availOnly" className="text-sm font-medium text-slate-700 cursor-pointer">
              Available donors only
            </label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1">
              <Filter className="w-4 h-4" />
              <span>Apply Filters</span>
            </Button>
            <Button type="button" variant="outline" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {/* Cold Start / Slow Server Notice */}
      {showSlowNotice && isLoading && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-4 text-amber-900 text-sm flex items-start gap-3 shadow-sm animate-pulse">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
            <Clock className="w-4 h-4 animate-spin" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-amber-950">Waking up cloud server...</p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Our free-tier cloud backend hibernates when idle and may take up to 60 seconds to start on the first visit. The donors will appear automatically as soon as it responds.
            </p>
          </div>
        </div>
      )}

      {/* Error state with Working Retry Button */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-900 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-red-100 text-red-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-950">Unable to load voluntary donors</p>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-9">
            <Button type="button" variant="primary" size="sm" onClick={handleRetry} className="gap-1.5 text-xs py-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setError(null)} className="text-xs py-1.5">
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : donors.length === 0 ? (
        /* Empty state */
        <Card className="text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Matching Donors Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            We couldn't find any voluntary donors matching your current filters. Try selecting "All Blood Groups" or checking neighboring cities.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" onClick={resetFilters}>
              Clear All Filters
            </Button>
            <Button variant="primary" onClick={handleRetry} className="gap-1.5">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Results</span>
            </Button>
          </div>
        </Card>
      ) : (
        /* Donor Cards Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>
              Showing {donors.length} of {totalDonors} registered donors
            </span>
            {isRevalidating && (
              <span className="inline-flex items-center gap-1.5 text-slate-400 font-normal lowercase tracking-normal">
                <RefreshCw className="w-3 h-3 animate-spin text-crimson-600" />
                updating...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donors.map((donor) => {
              const isAvailable = Boolean(donor.isAvailable ?? donor.available);
              return (
                <Card key={donor.id} hoverEffect className="flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{donor.displayName}</h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{donor.city}{donor.area ? `, ${donor.area}` : ''}</span>
                        </div>
                      </div>
                      <Badge variant="blood" size="md">
                        {donor.bloodGroup}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      {isAvailable ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Available Now
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          Temporarily Unavailable
                        </span>
                      )}

                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 font-medium">
                        {donor.totalDonations} {donor.totalDonations === 1 ? 'donation' : 'donations'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
                      <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Contact details protected by privacy consent</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link to={`/donors/${donor.id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full justify-between">
                        <span>View Profile & Contact</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
