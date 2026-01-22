export const Config = {
  // API Configuration
  API_URL: __DEV__ 
    ? 'http://localhost:8000/api/v1'  // Development
    : 'https://api.eazylink.io/v1',    // Production
  
  // App Configuration
  APP_NAME: 'EazyLink',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  ENABLE_VPN: false,      // Phase 2
  ENABLE_ESIM: false,     // Phase 2
  
  // Network Scanning
  SCAN_INTERVAL: 30000,   // 30 seconds
  QUALITY_THRESHOLD: 6.0, // Minimum quality score
};
