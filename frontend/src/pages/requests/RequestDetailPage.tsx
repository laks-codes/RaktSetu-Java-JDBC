import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { BloodRequest, DonorResponse, RequestStatus, ResponseStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Skeleton } from '../../components/common/Skeleton';
import { DisclaimerBanner } from '../../components/common/DisclaimerBanner';
import { useAuth } from '../../hooks/useAuth';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  HeartHandshake, 
  Check, 
  X,
  FileCheck2,
  Calendar
} from 'lucide-react';

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();

  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [responses, setResponses] = useState<DonorResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Response dialog state
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [respondStatus, setRespondStatus] = useState<ResponseStatus>('ACCEPTED');
  const [respondMessage, setRespondMessage] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  // Status transition state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<RequestStatus>('FULFILLED');
  const [statusReason, setStatusReason] = useState('');
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const requestId = Number(id);

  const fetchRequestDetails = async () => {
    if (!requestId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await requestService.getRequestById(requestId);
      setRequest(data);

      // If user is request owner or admin, fetch responses
      if (user && (user.id === data.requesterId || user.role === 'ROLE_ADMIN')) {
        try {
          const resps = await requestService.getResponsesForRequest(requestId);
          setResponses(resps);
        } catch {
          // May not have permission or no responses
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load blood request details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id, user]);

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId) return;
    setIsSubmittingResponse(true);
    setError(null);

    try {
      await requestService.respondToRequest(requestId, {
        status: respondStatus,
        message: respondMessage,
        estimatedArrival: estimatedArrival ? new Date(estimatedArrival).toISOString() : undefined,
      });

      setIsRespondModalOpen(false);
      setActionSuccess('Your response has been registered and shared with the requester!');
      fetchRequestDetails();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to submit response.');
      }
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId) return;
    setIsSubmittingStatus(true);
    setError(null);

    try {
      await requestService.updateRequestStatus(requestId, targetStatus, statusReason);
      setIsStatusModalOpen(false);
      setActionSuccess(`Request status successfully transitioned to ${targetStatus}`);
      fetchRequestDetails();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update request status.');
      }
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        <Link to="/requests">
          <Button variant="ghost" size="sm" className="gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Requests
          </Button>
        </Link>
        <Alert type="error">{error}</Alert>
      </div>
    );
  }

  if (!request) return null;

  const isOwner = user && user.id === request.requesterId;
  const isAdmin = user && user.role === 'ROLE_ADMIN';
  const isDonor = user && (user.role === 'ROLE_DONOR' || user.role === 'ROLE_ADMIN');
  const isClosed = request.status === 'FULFILLED' || request.status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link to="/requests">
        <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
          <ArrowLeft className="w-4 h-4" /> Back to All Requests
        </Button>
      </Link>

      <DisclaimerBanner compact />

      {actionSuccess && (
        <Alert type="success" onClose={() => setActionSuccess(null)}>
          {actionSuccess}
        </Alert>
      )}

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Request Card */}
      <Card className="shadow-md border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <Badge variant="blood" size="md">
                {request.bloodGroup} Needed
              </Badge>
              <Badge variant="urgency" urgency={request.urgency} size="sm">
                {request.urgency}
              </Badge>
              <Badge variant="status" status={request.status} size="sm">
                {request.status}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {request.unitsRequested} {request.unitsRequested === 1 ? 'Unit' : 'Units'} for {request.patientName}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Broadcasted by {request.requesterName} on {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(isOwner || isAdmin) && !isClosed && (
              <Button size="sm" variant="outline" onClick={() => setIsStatusModalOpen(true)}>
                <FileCheck2 className="w-4 h-4" />
                <span>Update Status</span>
              </Button>
            )}

            {isDonor && !isClosed && !isOwner && (
              <Button size="md" variant="primary" onClick={() => setIsRespondModalOpen(true)}>
                <HeartHandshake className="w-4 h-4" />
                <span>Respond to Request</span>
              </Button>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-100">
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hospital & Location</h4>
            
            <div className="flex items-start gap-3 text-sm text-slate-800">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">{request.hospitalName}</strong>
                {request.hospitalAddress && (
                  <span className="text-xs text-slate-500">{request.hospitalAddress}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-800">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{request.city}{request.area ? `, ${request.area}` : ''}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Timing & Contact</h4>

            <div className="flex items-center gap-3 text-sm text-slate-800">
              <Clock className="w-4 h-4 text-crimson-600 shrink-0" />
              <span>
                Required By:{' '}
                <strong className="text-crimson-700">
                  {new Date(request.requiredBy).toLocaleString()}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-800">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Emergency Contact:{' '}
                <a href={`tel:${request.contactPhone}`} className="font-bold text-crimson-600 hover:underline">
                  {request.contactPhone}
                </a>
              </span>
            </div>
          </div>
        </div>

        {request.notes && (
          <div className="py-4 border-b border-slate-100">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Special Instructions</h4>
            <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/60 leading-relaxed">
              {request.notes}
            </p>
          </div>
        )}

        {isClosed && (
          <div className="mt-6 p-4 rounded-xl bg-slate-100 text-slate-700 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>This request is marked as <strong>{request.status}</strong> and is no longer accepting new donor responses.</span>
          </div>
        )}
      </Card>

      {/* Responses Section (Visible to Request Owner or Admin) */}
      {(isOwner || isAdmin) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              Donor Responses ({responses.length})
            </h3>
          </div>

          {responses.length === 0 ? (
            <Card className="text-center py-10 text-slate-500 text-sm">
              No donors have responded to this request yet. Broadcast details have been shared with matching donors.
            </Card>
          ) : (
            <div className="space-y-3">
              {responses.map((resp) => (
                <Card key={resp.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 text-sm">{resp.donorName}</strong>
                      {resp.donorBloodGroup && (
                        <Badge variant="blood" size="sm">{resp.donorBloodGroup}</Badge>
                      )}
                      <Badge variant="success" size="sm">{resp.status}</Badge>
                    </div>

                    {resp.message && (
                      <p className="text-xs text-slate-600 mt-1 italic">"{resp.message}"</p>
                    )}

                    {resp.estimatedArrival && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Estimated Arrival: {new Date(resp.estimatedArrival).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {resp.donorPhone && (
                    <a href={`tel:${resp.donorPhone}`}>
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-crimson-600" />
                        <span>{resp.donorPhone}</span>
                      </Button>
                    </a>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Respond to Request */}
      <Modal
        isOpen={isRespondModalOpen}
        onClose={() => setIsRespondModalOpen(false)}
        title="Respond to Blood Request"
      >
        <form onSubmit={handleRespond} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Confirm your availability to donate for <strong>{request.patientName}</strong> at <strong>{request.hospitalName}</strong>.
          </p>

          <Select
            label="Response"
            options={[
              { value: 'ACCEPTED', label: 'I can donate (Accept Request)' },
              { value: 'DECLINED', label: 'Cannot donate right now' },
            ]}
            value={respondStatus}
            onChange={(e) => setRespondStatus(e.target.value as ResponseStatus)}
            required
          />

          <Input
            label="Estimated Arrival Time at Hospital"
            type="datetime-local"
            value={estimatedArrival}
            onChange={(e) => setEstimatedArrival(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Message to Requester (Optional)
            </label>
            <textarea
              rows={3}
              value={respondMessage}
              onChange={(e) => setRespondMessage(e.target.value)}
              placeholder="e.g. I can be at the blood bank by 2 PM. Please let me know who to ask for."
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsRespondModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingResponse}>
              Submit Response
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Update Request Status */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Request Status"
      >
        <form onSubmit={handleStatusChange} className="space-y-4">
          <Select
            label="Target Status"
            options={[
              { value: 'IN_PROGRESS', label: 'IN_PROGRESS — Donor confirmed & on the way' },
              { value: 'FULFILLED', label: 'FULFILLED — Blood units collected & received' },
              { value: 'CANCELLED', label: 'CANCELLED — No longer required' },
            ]}
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value as RequestStatus)}
            required
          />

          <Input
            label="Reason / Notes"
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
            placeholder="e.g. Received 2 units from Lilavati blood bank"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingStatus}>
              Confirm Status Change
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
