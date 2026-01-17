import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { apiGateway } from '@/lib/api/gateway';
import { authService } from '../services/authService';
import type {
  User,
  AuthSession,
  AuthContextValue,
  RegisterRequest,
  AUTH_STORAGE_KEYS,
} from '../types';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
  SESSION_EXPIRES_AT: 'auth_session_expires_at',
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && !!session;

  // Clear all auth data
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRES_AT);
    apiGateway.setAuthToken(null);
    setUser(null);
    setSession(null);
  }, []);

  // Store auth data
  const storeAuthData = useCallback((userData: User, accessToken: string, refreshToken: string, expiresIn: number) => {
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRES_AT, expiresAt);
    
    apiGateway.setAuthToken(accessToken);
    
    const newSession: AuthSession = {
      user: userData,
      accessToken,
      refreshToken,
      expiresAt,
    };
    
    setUser(userData);
    setSession(newSession);
  }, []);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const storedExpiresAt = localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRES_AT);

        if (!storedToken || !storedUser || !storedExpiresAt) {
          clearAuthData();
          return;
        }

        // Check if session is expired
        const expiresAt = new Date(storedExpiresAt);
        const isExpired = expiresAt <= new Date();

        if (isExpired && storedRefreshToken) {
          // Try to refresh the token
          try {
            const refreshResult = await authService.refreshToken(storedRefreshToken);
            const userData = JSON.parse(storedUser) as User;
            storeAuthData(userData, refreshResult.accessToken, storedRefreshToken, refreshResult.expiresIn);
          } catch {
            // Refresh failed, clear auth
            clearAuthData();
          }
        } else if (!isExpired) {
          // Session is still valid
          const userData = JSON.parse(storedUser) as User;
          apiGateway.setAuthToken(storedToken);
          setUser(userData);
          setSession({
            user: userData,
            accessToken: storedToken,
            refreshToken: storedRefreshToken || '',
            expiresAt: storedExpiresAt,
          });
        } else {
          clearAuthData();
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [clearAuthData, storeAuthData]);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.login({ email, password });
      storeAuthData(result.user, result.tokens.accessToken, result.tokens.refreshToken, result.tokens.expiresIn);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storeAuthData]);

  // Register
  const register = useCallback(async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.register(data);
      storeAuthData(result.user, result.tokens.accessToken, result.tokens.refreshToken, result.tokens.expiresIn);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storeAuthData]);

  // Logout
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuthData();
      setIsLoading(false);
    }
  }, [clearAuthData]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const result = await authService.refreshToken(refreshToken);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const userData = JSON.parse(storedUser) as User;
        storeAuthData(userData, result.accessToken, refreshToken, result.expiresIn);
      }
    } catch (err) {
      clearAuthData();
      throw err;
    }
  }, [clearAuthData, storeAuthData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextValue = {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshSession,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
