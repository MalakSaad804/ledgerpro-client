import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

const TOKEN_KEY = 'ledgerpro_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// expired or invalid token: clear it and let the app send the user to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const code = err.response?.data?.error;
    if (err.response?.status === 401 && ['TOKEN_EXPIRED', 'INVALID_TOKEN'].includes(code)) {
      setToken(null);
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(err);
  }
);

// turn any axios error into a readable message
export function errorMessage(err) {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (err.request) return 'Cannot reach the server. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
}

export default api;
