/**
 * Application Configuration
 * Environment-based settings for API endpoints and feature flags
 */

interface AppConfig {
  /** Base URL for the API Gateway (e.g., http://localhost:3000 in dev) */
  apiGatewayUrl: string;
  
  /** Use mock data when API is unavailable (useful for preview/Lovable environment) */
  useMockData: boolean;
  
  /** Enable debug logging */
  debug: boolean;
  
  /** Environment name */
  environment: 'development' | 'preview' | 'production';
}

function getEnvironment(): AppConfig['environment'] {
  const env = import.meta.env.VITE_APP_ENV || import.meta.env.MODE;
  if (env === 'production') return 'production';
  if (env === 'preview') return 'preview';
  return 'development';
}

function createConfig(): AppConfig {
  const environment = getEnvironment();
  
  // Check if we're in Lovable preview (no real backend available)
  const isLovablePreview = typeof window !== 'undefined' && 
    window.location.hostname.includes('lovable.app');
  
  return {
    apiGatewayUrl: import.meta.env.VITE_API_GATEWAY_URL || '/api',
    
    // Use mock data in preview or when explicitly enabled
    // In production with a real backend, set VITE_USE_MOCK_DATA=false
    useMockData: 
      import.meta.env.VITE_USE_MOCK_DATA === 'true' || 
      isLovablePreview ||
      (environment !== 'production' && !import.meta.env.VITE_API_GATEWAY_URL),
    
    debug: import.meta.env.VITE_DEBUG === 'true' || environment === 'development',
    
    environment,
  };
}

export const config = createConfig();

// Log config in development
if (config.debug) {
  console.log('[Config]', {
    environment: config.environment,
    apiGatewayUrl: config.apiGatewayUrl,
    useMockData: config.useMockData,
  });
}
