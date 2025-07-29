// Content Security Policy utilities for enhanced security

export const CSP_DIRECTIVES = {
  // Basic CSP configuration for React apps
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for React development
    "'unsafe-eval'", // Required for development mode
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled components and CSS-in-JS
    "https://fonts.googleapis.com",
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com",
    "data:",
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:",
  ],
  'connect-src': [
    "'self'",
    "https://api.lovable.app",
    // Add your API endpoints here
  ],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

export function generateCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

export function generateCSPMeta(): string {
  return generateCSPHeader();
}

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export function validateCSP(): boolean {
  // Check if CSP is properly configured
  const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
  return metaTags.length > 0;
}