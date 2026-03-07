// API Configuration
// In development, Vite proxies /reports/* to the backend (avoids CORS).
// In production (S3), requests go directly to the backend. The backend must
// allow CORS from the S3 origin: http://proctoringreports.s3-website-us-east-1.amazonaws.com
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://proctoring.formapply.in';

// Use a relative base in dev so the Vite proxy handles CORS.
// In production the full URL is needed for cross-origin requests.
const BASE = import.meta.env.DEV ? '' : API_BASE_URL;

export const API_ENDPOINTS = {
  getReport: (sessionId: string) => `${BASE}/reports/report/${sessionId}`,
  getCandidateReports: (candidateId: string) => `${BASE}/reports/candidate/${candidateId}`,
} as const;

export { API_BASE_URL };

