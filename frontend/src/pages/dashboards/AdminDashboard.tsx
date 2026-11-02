import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { AdminDashboardStats, AuditLog, UserStatus } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { CardSkeleton } from '../../components/common/Skeleton';
import { 
  Users, 
  Heart, 
  FileText, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  UserX, 
  Clock 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Moderate user modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [modUserId, setModUserId] = useState('');
  const [modStatus, setModStatus] = useState<UserStatus>('SUSPENDED');
  const [modReason, setModReason] = useState('');
  const [isSubmittingMod, setIsSubmittingMod] = useState(false);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const statsData = await adminService.getDashboardStats();
      setStats(statsData);

      const logsData = await adminService.getAuditReports(0, 10);
      setAuditLogs(logsData.content);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load administrator dashboard data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleModerateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modUserId || !modReason) return;
    setIsSubmittingMod(true);
    setError(null);

    try {
      const res = await adminService.updateUserStatus(Number(modUserId), modStatus, modReason);
      setIsUserModalOpen(false);
      setActionSuccess(res.message);
      setModUserId('');
      setModReason('');
      fetchAdminData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsSubmittingMod(false);
    }
  };

  return (
    <DashboardLayout
      title="System Administration"
      subtitle="Platform telemetry, user moderation, and tamper-evident audit logs"
      actionButton={
        <Button variant="secondary" onClick={() => setIsUserModalOpen(true)}>
          <UserX className="w-4 h-4" />
          <span>Moderate User Status</span>
        </Button>
      }
    >
      <div className="space-y-8">
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

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{stats.totalUsers}</div>
                <div className="text-xs text-slate-500 font-medium">Total Registered Users</div>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-crimson-50 text-crimson-600 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">
                  {stats.activeDonors} <span className="text-xs text-slate-400 font-normal">/ {stats.totalDonors}</span>
                </div>
                <div className="text-xs text-slate-500 font-medium">Active Available Donors</div>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{stats.totalRequests}</div>
                <div className="text-xs text-slate-500 font-medium">{stats.openRequests} open emergency posts</div>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{stats.fulfillmentRate}%</div>
                <div className="text-xs text-slate-500 font-medium">Request Fulfillment Rate</div>
              </div>
            </Card>
          </div>
        ) : null}

        {/* Audit Log Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-slate-700" />
              <span>Administrative Audit Trail ({auditLogs.length} events)</span>
            </h3>
          </div>

          <Card className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Admin Email</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Target</th>
                  <th className="px-6 py-3.5">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-900 text-xs">
                      {log.adminEmail}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-700">
                      {log.targetEntity} #{log.targetId}
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-600 max-w-xs truncate">
                      {log.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      {/* Modal: Moderate User */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Administrative User Moderation"
      >
        <form onSubmit={handleModerateUser} className="space-y-4">
          <Input
            label="User ID to Moderate"
            type="number"
            value={modUserId}
            onChange={(e) => setModUserId(e.target.value)}
            placeholder="e.g. 5"
            required
          />

          <Select
            label="New Account Status"
            options={[
              { value: 'ACTIVE', label: 'ACTIVE — Regular access' },
              { value: 'SUSPENDED', label: 'SUSPENDED — Block login and requests' },
              { value: 'INACTIVE', label: 'INACTIVE — Deactivated' },
            ]}
            value={modStatus}
            onChange={(e) => setModStatus(e.target.value as UserStatus)}
            required
          />

          <Input
            label="Audit Justification / Reason"
            value={modReason}
            onChange={(e) => setModReason(e.target.value)}
            placeholder="e.g. Repeated non-compliance with non-commercial guidelines"
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsUserModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" isLoading={isSubmittingMod}>
              Apply Audit Record
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
