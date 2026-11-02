import { apiClient, setAuthToken, removeAuthToken } from './apiClient';
import { AuthResponse, UserProfile, Role, BloodGroup } from '../types';

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  city: string;
  role?: Role;
  bloodGroup?: BloodGroup;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload);
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  async getCurrentUser(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/auth/me');
  },

  logout(): void {
    removeAuthToken();
  }
};
