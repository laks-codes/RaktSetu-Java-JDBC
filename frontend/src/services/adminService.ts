import { apiClient } from './apiClient';
import { AdminDashboardStats, AuditLog, PagedResponse, UserStatus } from '../types';

export const adminService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    return apiClient.get<AdminDashboardStats>('/admin/dashboard');
  },

  async getAuditReports(page = 0, size = 10): Promise<PagedResponse<AuditLog>> {
    return apiClient.get<PagedResponse<AuditLog>>(`/admin/reports?page=${page}&size=${size}`);
  },

  async updateUserStatus(userId: number, status: UserStatus, reason: string): Promise<{ success: boolean; message: string }> {
    return apiClient.patch<{ success: boolean; message: string }>(`/admin/users/${userId}/status`, { status, reason });
  },

  async closeRequestByAdmin(requestId: number, reason: string): Promise<{ success: boolean; message: string }> {
    return apiClient.patch<{ success: boolean; message: string }>(`/admin/requests/${requestId}/close?reason=${encodeURIComponent(reason)}`);
  }
};
