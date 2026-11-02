import { apiClient } from './apiClient';
import { BloodGroup, DonorProfile, DonorPublic, PagedResponse } from '../types';

export interface DonorSearchParams {
  bloodGroup?: BloodGroup | '';
  city?: string;
  availableOnly?: boolean;
  page?: number;
  size?: number;
}

export interface CreateDonorProfilePayload {
  bloodGroup: BloodGroup;
  city: string;
  area?: string;
  isAvailable?: boolean;
  consentToContact?: boolean;
  lastDonationDate?: string;
  notes?: string;
}

export interface UpdateDonorProfilePayload {
  bloodGroup?: BloodGroup;
  city?: string;
  area?: string;
  isAvailable?: boolean;
  consentToContact?: boolean;
  lastDonationDate?: string;
  notes?: string;
}

interface CacheEntry {
  data: PagedResponse<DonorPublic>;
  timestamp: number;
}

const donorSearchCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

function generateCacheKey(params: DonorSearchParams): string {
  return [
    params.bloodGroup || '',
    (params.city || '').trim().toLowerCase(),
    params.availableOnly !== undefined ? String(params.availableOnly) : 'true',
    params.page || 0,
    params.size || 10,
  ].join('|');
}

function normalizeDonorPublic(d: DonorPublic): DonorPublic {
  return {
    ...d,
    isAvailable: d.isAvailable ?? d.available ?? false,
  };
}

function normalizeDonorProfile(p: DonorProfile): DonorProfile {
  return {
    ...p,
    isAvailable: p.isAvailable ?? p.available ?? false,
  };
}

export const donorService = {
  /**
   * Return in-memory cached donors immediately if available (for SWR fast display)
   */
  getCachedDonors(params: DonorSearchParams = {}): PagedResponse<DonorPublic> | null {
    const key = generateCacheKey(params);
    const entry = donorSearchCache.get(key);
    if (!entry) return null;
    // Return cached data even if expired so UI renders instantly while background revalidation finishes
    return entry.data;
  },

  /**
   * Search donors with caching and optional AbortSignal support
   */
  async searchDonors(
    params: DonorSearchParams = {},
    options?: { signal?: AbortSignal; bypassCache?: boolean }
  ): Promise<PagedResponse<DonorPublic>> {
    const key = generateCacheKey(params);

    // If fresh in cache and bypass not requested, return immediately
    if (!options?.bypassCache) {
      const entry = donorSearchCache.get(key);
      if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
        return entry.data;
      }
    }

    const query = new URLSearchParams();
    if (params.bloodGroup) query.append('bloodGroup', params.bloodGroup);
    if (params.city) query.append('city', params.city);
    if (params.availableOnly !== undefined) query.append('availableOnly', String(params.availableOnly));
    if (params.page !== undefined) query.append('page', String(params.page));
    if (params.size !== undefined) query.append('size', String(params.size));

    const endpoint = `/donors${query.toString() ? `?${query.toString()}` : ''}`;
    const rawResponse = await apiClient.get<PagedResponse<DonorPublic>>(endpoint, {
      signal: options?.signal,
    });

    const normalizedResponse: PagedResponse<DonorPublic> = {
      ...rawResponse,
      content: (rawResponse.content || []).map(normalizeDonorPublic),
    };

    // Store in memory cache
    donorSearchCache.set(key, {
      data: normalizedResponse,
      timestamp: Date.now(),
    });

    return normalizedResponse;
  },

  async getDonorById(id: number): Promise<DonorProfile> {
    const profile = await apiClient.get<DonorProfile>(`/donors/${id}`);
    return normalizeDonorProfile(profile);
  },

  async getMyDonorProfile(): Promise<DonorProfile> {
    const profile = await apiClient.get<DonorProfile>('/donors/me');
    return normalizeDonorProfile(profile);
  },

  async createDonorProfile(payload: CreateDonorProfilePayload): Promise<DonorProfile> {
    const profile = await apiClient.post<DonorProfile>('/donors', payload);
    donorSearchCache.clear();
    return normalizeDonorProfile(profile);
  },

  async updateDonorProfile(id: number, payload: UpdateDonorProfilePayload): Promise<DonorProfile> {
    const profile = await apiClient.put<DonorProfile>(`/donors/${id}`, payload);
    donorSearchCache.clear();
    return normalizeDonorProfile(profile);
  },

  async updateAvailability(id: number, isAvailable: boolean): Promise<DonorProfile> {
    const profile = await apiClient.patch<DonorProfile>(`/donors/${id}/availability`, { isAvailable });
    donorSearchCache.clear();
    return normalizeDonorProfile(profile);
  },

  clearCache(): void {
    donorSearchCache.clear();
  },
};
