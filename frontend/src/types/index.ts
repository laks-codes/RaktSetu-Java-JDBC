export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Role = 'ROLE_REQUESTER' | 'ROLE_DONOR';
export type UrgencyLevel = 'CRITICAL' | 'URGENT' | 'NORMAL';

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  city: string;
  role: Role;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: UserProfile;
}

export interface DonorPublic {
  id: number;
  userId: number;
  displayName: string;
  bloodGroup: BloodGroup;
  city: string;
  area?: string;
  isAvailable: boolean;
  consentToContact: boolean;
  phoneNumber?: string;
  email?: string;
  lastDonationDate?: string;
  totalDonations: number;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
