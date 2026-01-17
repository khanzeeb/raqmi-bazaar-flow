import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  EmailVerification,
  ResendVerificationForm,
  useAuth,
} from '@/features/auth';

export default function Auth() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to home (except for email verification)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Allow email verification even when logged in
      const path = window.location.pathname;
      if (!path.includes('verify-email')) {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">RaqmiStore</h1>
          <p className="text-muted-foreground mt-2">Business Management Platform</p>
        </div>
        
        <Routes>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<LoginForm />} />
          <Route path="register" element={<RegisterForm />} />
          <Route path="forgot-password" element={<ForgotPasswordForm />} />
          <Route path="reset-password" element={<ResetPasswordForm />} />
          <Route path="verify-email" element={<EmailVerification />} />
          <Route path="resend-verification" element={<ResendVerificationForm />} />
        </Routes>
      </div>
    </div>
  );
}