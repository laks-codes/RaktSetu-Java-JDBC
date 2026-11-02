export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type Role = 'ROLE_GUEST' | 'ROLE_REQUESTER' | 'ROLE_DONOR' | 'ROLE_ADMIN';

export type RequestStatus = 'OPEN' | 'IN_PROGRESS' | 'FULFILLED' | 'CANCELLED';

export type ResponseStatus = 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';

export type UrgencyLevel = 'CRITICAL' | 'URGENT' | 'NORMAL';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  city: string;
  role: Role;
  status: UserStatus;
  donorProfileId?: number | null;
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
  available?: boolean;
  consentToContact: boolean;
  lastDonationDate?: string;
  totalDonations: number;
}

export interface DonorProfile {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  bloodGroup: BloodGroup;
  city: string;
  area?: string;
  isAvailable: boolean;
  available?: boolean;
  consentToContact: boolean;
  lastDonationDate?: string;
  totalDonations: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BloodRequest {
  id: number;
  requesterId: number;
  requesterName: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequested: number;
  hospitalName: string;
  hospitalAddress?: string;
  city: string;
  area?: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  requiredBy: string;
  contactPhone: string;
  notes?: string;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DonorResponse {
  id: number;
  requestId: number;
  donorId: number;
  donorName: string;
  donorBloodGroup?: BloodGroup;
  donorPhone?: string;
  status: ResponseStatus;
  message?: string;
  estimatedArrival?: string;
  createdAt: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalDonors: number;
  activeDonors: number;
  totalRequests: number;
  openRequests: number;
  inProgressRequests: number;
  fulfilledRequests: number;
  totalResponses: number;
  fulfillmentRate: number;
}

export interface AuditLog {
  id: number;
  adminId: number;
  adminEmail: string;
  action: string;
  targetEntity: string;
  targetId: number;
  reason: string;
  timestamp: string;
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
  validationErrors?: Array<{
    field: string;
    rejectedValue: unknown;
    message: string;
  }>;
}
