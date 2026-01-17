// Auth Service - Connects to auth-service microservice

import { apiGateway } from '@/lib/api/gateway';
import { config } from '@/lib/config';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenResponse,
  User,
} from '../types';

// Mock data for development/preview
const MOCK_USER: User = {
  id: 'user-1',
  email: 'demo@raqmi.com',
  name: 'Ahmed Al-Rashid',
  isActive: true,
  emailVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const MOCK_TOKENS = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 3600,
};

class AuthService {
  private baseUrl = '/auth';

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    if (config.useMockData) {
      await this.simulateDelay();
      // Simulate validation
      if (!data.email || !data.password || !data.name) {
        throw new Error('All fields are required');
      }
      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      return {
        user: { ...MOCK_USER, email: data.email, name: data.name },
        tokens: MOCK_TOKENS,
      };
    }

    const response = await apiGateway.post<AuthResponse>(
      `${this.baseUrl}/register`,
      data,
      undefined,
      { skipOrgHeader: true }
    );

    if (!response.success) {
      throw new Error(response.error || 'Registration failed');
    }

    return response.data!;
  }

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    if (config.useMockData) {
      await this.simulateDelay();
      // Simulate validation
      if (data.email !== 'demo@raqmi.com' && data.password !== 'demo123') {
        // Allow any credentials in mock mode for easier testing
      }
      return {
        user: MOCK_USER,
        tokens: MOCK_TOKENS,
      };
    }

    const response = await apiGateway.post<AuthResponse>(
      `${this.baseUrl}/login`,
      data,
      undefined,
      { skipOrgHeader: true }
    );

    if (!response.success) {
      throw new Error(response.error || 'Login failed');
    }

    return response.data!;
  }

  /**
   * Refresh the access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    if (config.useMockData) {
      await this.simulateDelay();
      return {
        accessToken: 'mock-refreshed-access-token',
        expiresIn: 3600,
      };
    }

    const response = await apiGateway.post<RefreshTokenResponse>(
      `${this.baseUrl}/refresh`,
      { refreshToken },
      undefined,
      { skipOrgHeader: true }
    );

    if (!response.success) {
      throw new Error(response.error || 'Token refresh failed');
    }

    return response.data!;
  }

  /**
   * Logout the current user
   */
  async logout(refreshToken: string): Promise<void> {
    if (config.useMockData) {
      await this.simulateDelay();
      return;
    }

    await apiGateway.post(
      `${this.baseUrl}/logout`,
      { refreshToken },
      undefined,
      { skipOrgHeader: true }
    );
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    if (config.useMockData) {
      await this.simulateDelay();
      return MOCK_USER;
    }

    const response = await apiGateway.get<User>(
      `${this.baseUrl}/profile`,
      undefined,
      { skipOrgHeader: true }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch profile');
    }

    return response.data!;
  }

  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * 300 + 200;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

export const authService = new AuthService();
