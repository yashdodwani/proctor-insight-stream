// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://proctoring.formapply.in";

// Dev proxy is opt-in. Defaulting to direct backend calls avoids local DNS
// resolution issues in Node-based dev proxy (e.g. ENOTFOUND in Vite).
const USE_DEV_PROXY = import.meta.env.DEV && import.meta.env.VITE_USE_DEV_PROXY === "true";
const REPORTS_BASE = USE_DEV_PROXY ? "" : API_BASE_URL;

export const API_ENDPOINTS = {
  getReport: (sessionId: string) => `${REPORTS_BASE}/reports/report/${sessionId}`,
  getCandidateReports: (candidateId: string) => `${REPORTS_BASE}/reports/candidate/${candidateId}`,
  getBatchReports: (batchId: string) => {
    const backendUrl = import.meta.env.DEV ? 'http://localhost:8000' : 'https://proctoring.formsapply.com';
    return `${backendUrl}/api/v1/proctoring/reports/batch/${batchId}`;
  },
  batchProctoring: `${REPORTS_BASE}/proctoring/batch`,
  batchStatus: (jobId: string) => `${REPORTS_BASE}/proctoring/batch/status/${jobId}`,
  downloadBatch: (jobId: string) => `${REPORTS_BASE}/proctoring/batch/download/${jobId}`,
  register: () => `${API_BASE_URL.includes('localhost') ? 'http://localhost:8000' : API_BASE_URL}/auth/register`,
} as const;

/**
 * Returns headers for every API request.
 * Evaluated lazily so the env var value is always current (important for
 * production builds where Vite inlines the value at bundle time).
 */
const API_KEY = (import.meta.env.VITE_API_KEY || "proctoringv0@yash").trim();

export const getApiHeaders = (): Record<string, string> => {
  return {
    'X-API-Key': API_KEY,
  };
};


export { API_BASE_URL };
