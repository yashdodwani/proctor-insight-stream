// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://proctoring.formapply.in';

export const API_ENDPOINTS = {
  getReport: (sessionId: string) => `${API_BASE_URL}/reports/report/${sessionId}`,
  getCandidateReports: (candidateId: string) => `${API_BASE_URL}/reports/candidate/${candidateId}`,
} as const;

export { API_BASE_URL };

