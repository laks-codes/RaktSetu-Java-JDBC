import { apiClient } from './apiClient';
import { BloodGroup, UrgencyLevel } from '../types';

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

export interface CreateRequestResult {
  id: number;
  message: string;
}

export const requestService = {
  createRequest(payload: CreateRequestPayload): Promise<CreateRequestResult> {
    return apiClient.post<CreateRequestResult>('/requests', payload);
  },
};
