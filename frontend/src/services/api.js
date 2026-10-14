// During development, Vite forwards /api to the local backend. Relative URLs
// work whether the page is opened on localhost or another device on the LAN.
export const API_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

export function apiErrorMessage(error, fallback) {
  if (typeof error.response?.data?.error === 'string') return error.response.data.error;
  if (!error.response || error.response.status >= 500) {
    return 'Cannot reach the account server. Make sure the backend and MongoDB are running, then try again.';
  }
  return fallback;
}
