import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { BloodRequest, RequestStatus } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { CardSkeleton } from '../../components/common/Skeleton';
import { PlusCircle, FileText, CheckCircle2, Clock, Eye, AlertTriangle } from 'lucide-react';

export const RequesterDashboard: React.FC = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status modal
  const [selectedReq, setSelectedReq] = useState<BloodRequest | null>(null);
  const [targetStatus, setTargetStatus] = useState<RequestStatus>('FULFILLED');
  const [reason, setReason] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchMyRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await requestService.getMyRequests();
      setRequests(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load your requests');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    setIsUpdatingStatus(true);
    try {
      await requestService.updateRequestStatus(selectedReq.id, targetStatus, reason);
      setSelectedReq(null);
      fetchMyRequests();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const totalRequests = requests.length;
  const openRequests = requests.filter((r) => r.status === 'OPEN' || r.status === 'IN_PROGRESS').length;
  const fulfilledRequests = requests.filter((r) => r.status === 'FULFILLED').length;

  return (
    <DashboardLayout
      title="Requester Dashboard"
      subtitle="Track your active blood requests and incoming donor responses"
      actionButton={
        <Link to="/requests/create">
          <Button variant="primary">
            <PlusCircle className="w-4 h-4" />
            <span>New Emergency Request</span>
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

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-crimson-50 text-crimson-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{totalRequests}</div>
              <div className="text-xs text-slate-500 font-medium">Total Requests Posted</div>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{openRequests}</div>
              <div className="text-xs text-slate-500 font-medium">Active / In Progress</div>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{fulfilledRequests}</div>
              <div className="text-xs text-slate-500 font-medium">Successfully Fulfilled</div>
            </div>
          </Card>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">My Emergency Posts</h2>

          {isLoading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : requests.length === 0 ? (
            <Card className="text-center py-12 space-y-3">
              <p className="text-slate-500 text-sm">You have not created any emergency blood requests yet.</p>
              <Link to="/requests/create">
                <Button variant="primary">Create Blood Request</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <Card key={req.id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="blood" size="sm">
                        {req.bloodGroup}
                      </Badge>
                      <Badge variant="urgency" urgency={req.urgency} size="sm">
                        {req.urgency}
                      </Badge>
                      <Badge variant="status" status={req.status} size="sm">
                        {req.status}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        Posted {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {req.unitsRequested} {req.unitsRequested === 1 ? 'Unit' : 'Units'} for {req.patientName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {req.hospitalName} ({req.city}) • Required by {new Date(req.requiredBy).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-xs text-slate-600">
                      <strong>{req.responseCount}</strong> volunteer donor responses received
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Link to={`/requests/${req.id}`} className="flex-1 md:flex-initial">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </Button>
                    </Link>

                    {req.status !== 'FULFILLED' && req.status !== 'CANCELLED' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedReq(req);
                          setTargetStatus('FULFILLED');
                        }}
                      >
                        Update Status
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Status Update */}
      <Modal
        isOpen={!!selectedReq}
        onClose={() => setSelectedReq(null)}
        title="Update Request Status"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <p className="text-xs text-slate-600">
            Updating status for request: <strong>{selectedReq?.patientName}</strong> ({selectedReq?.bloodGroup})
          </p>

          <Select
            label="New Status"
            options={[
              { value: 'IN_PROGRESS', label: 'IN_PROGRESS — Donors on the way' },
              { value: 'FULFILLED', label: 'FULFILLED — Blood units collected' },
              { value: 'CANCELLED', label: 'CANCELLED — No longer needed' },
            ]}
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value as RequestStatus)}
            required
          />

          <Input
            label="Fulfillment / Cancellation Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Received 2 units from lilavati hospital"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setSelectedReq(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isUpdatingStatus}>
              Save Status
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
