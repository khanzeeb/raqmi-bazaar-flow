// Auth Service - Connects to auth-service microservice

import { apiGateway } from '@/lib/api/gateway';
import { config } from '@/lib/config';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenResponse,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  SuccessResponse,
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
      if (!data.email || !data.password || !data.name) {
        throw new Error('All fields are required');
      }
      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      return {
        user: { ...MOCK_USER, email: data.email, name: data.name, emailVerified: false },
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
      `${this.baseUrl}/me`,
      undefined,
      { skipOrgHeader: true }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch profile');
    }

    return response.data!;
  }

  /**
   * Request password reset email
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<SuccessResponse> {
    if (config.useMockData) {
      await this.simulateDelay();
      return { success: true, message: 'If the email exists, a reset link has been sent' };
    }

    const response = await apiGateway.post<SuccessResponse>(
      `${this.baseUrl}/forgot-password`,
      data,
      undefined,
      { skipOrgHeader: true }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to send reset email');
    }

    return response.data!;
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<SuccessResponse> {
    if (config.useMockData) {
      await this.simulateDelay();
      if (data.newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      return { success: true, message: 'Password reset successfully' };
    }

    const response = await apiGateway.post<SuccessResponse>(
      `${this.baseUrl}/reset-password`,
      data,
      undefined,
      { skipOrgHeader: true }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to reset password');
    }

    return response.data!;
  }

  /**
   * Verify email with token
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<SuccessResponse> {
    if (config.useMockData) {
      await this.simulateDelay();
      return { success: true, message: 'Email verified successfully' };
    }

    const response = await apiGateway.post<SuccessResponse>(
      `${this.baseUrl}/verify-email`,
      data,
      undefined,
      { skipOrgHeader: true }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to verify email');
    }

    return response.data!;
  }

  /**
   * Resend verification email
   */
  async resendVerification(data: ResendVerificationRequest): Promise<SuccessResponse> {
    if (config.useMockData) {
      await this.simulateDelay();
      return { success: true, message: 'If the email exists and is not verified, a verification link has been sent' };
    }

    const response = await apiGateway.post<SuccessResponse>(
      `${this.baseUrl}/resend-verification`,
      data,
      undefined,
      { skipOrgHeader: true }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to resend verification email');
    }

    return response.data!;
  }

  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * 300 + 200;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

export const authService = new AuthService();
