import { apiClient } from './apiClient';
import { BloodGroup, DonorPublic, PagedResponse } from '../types';

export interface DonorSearchParams {
  bloodGroup?: BloodGroup | '';
  city?: string;
}

export const donorService = {
  async searchDonors(params: DonorSearchParams = {}): Promise<PagedResponse<DonorPublic>> {
    const query = new URLSearchParams();
    if (params.bloodGroup) query.set('bloodGroup', params.bloodGroup);
    if (params.city) query.set('city', params.city);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<PagedResponse<DonorPublic>>(`/donors${suffix}`);
  },
};
