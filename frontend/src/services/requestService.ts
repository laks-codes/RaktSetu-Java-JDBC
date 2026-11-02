import { apiClient } from './apiClient';
import { BloodGroup, BloodRequest, DonorResponse, PagedResponse, RequestStatus, ResponseStatus, UrgencyLevel } from '../types';

export interface RequestSearchParams {
  bloodGroup?: BloodGroup | '';
  city?: string;
  status?: RequestStatus | '';
  urgency?: UrgencyLevel | '';
  page?: number;
  size?: number;
}

export interface CreateRequestPayload {
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequested: number;
  hospitalName: string;
  hospitalAddress?: string;
  city: string;
  area?: string;
  urgency: UrgencyLevel;
  requiredBy: string;
  contactPhone: string;
  notes?: string;
}

export interface RespondToRequestPayload {
  status: ResponseStatus;
  message?: string;
  estimatedArrival?: string;
}

export const requestService = {
  async searchRequests(params: RequestSearchParams = {}): Promise<PagedResponse<BloodRequest>> {
    const query = new URLSearchParams();
    if (params.bloodGroup) query.append('bloodGroup', params.bloodGroup);
    if (params.city) query.append('city', params.city);
    if (params.status) query.append('status', params.status);
    if (params.urgency) query.append('urgency', params.urgency);
    if (params.page !== undefined) query.append('page', String(params.page));
    if (params.size !== undefined) query.append('size', String(params.size));

    const endpoint = `/requests${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<PagedResponse<BloodRequest>>(endpoint);
  },

  async getRequestById(id: number): Promise<BloodRequest> {
    return apiClient.get<BloodRequest>(`/requests/${id}`);
  },

  async getMyRequests(): Promise<BloodRequest[]> {
    return apiClient.get<BloodRequest[]>('/requests/mine');
  },

  async createRequest(payload: CreateRequestPayload): Promise<BloodRequest> {
    return apiClient.post<BloodRequest>('/requests', payload);
  },

  async updateRequestStatus(id: number, status: RequestStatus, reason?: string): Promise<BloodRequest> {
    return apiClient.patch<BloodRequest>(`/requests/${id}/status`, { status, reason });
  },

  async respondToRequest(requestId: number, payload: RespondToRequestPayload): Promise<DonorResponse> {
    return apiClient.post<DonorResponse>(`/requests/${requestId}/responses`, payload);
  },

  async getResponsesForRequest(requestId: number): Promise<DonorResponse[]> {
    return apiClient.get<DonorResponse[]>(`/requests/${requestId}/responses`);
  },

  async getMyResponses(): Promise<DonorResponse[]> {
    return apiClient.get<DonorResponse[]>('/responses/mine');
  },

  async updateResponse(responseId: number, status: ResponseStatus, message?: string): Promise<DonorResponse> {
    return apiClient.patch<DonorResponse>(`/responses/${responseId}`, { status, message });
  }
};
