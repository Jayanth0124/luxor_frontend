import axios from 'axios';
import { store } from '@/store/store';
import { clearCredentials, setCredentials, selectAccessToken } from '@/store/authSlice';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081/api/v1';

const api = axios.create({
  baseURL:         BASE,
  withCredentials: true,
  timeout:         15000,
});

// Attach auth token on every request
api.interceptors.request.use((config) => {
  const token = selectAccessToken(store.getState());
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Token refresh logic ──────────────────────────────────────────────────────
let isRefreshing = false;
let queue = []; // pending requests waiting for new token

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // Only intercept 401s that aren't the refresh call itself and haven't been retried
    if (err.response?.status !== 401 || original._retry || original.url?.includes('/auth/refresh')) {
      return Promise.reject(err);
    }

    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem('luxor_refresh_token')
      : null;

    if (!refreshToken) {
      store.dispatch(clearCredentials());
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('luxor:require-login'));
      return Promise.reject(err);
    }

    if (isRefreshing) {
      // Queue this request until the refresh resolves
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken });
      const newToken = data.data.accessToken;

      // Persist new access token
      const state = store.getState();
      store.dispatch(setCredentials({
        accessToken:  newToken,
        refreshToken: localStorage.getItem('luxor_refresh_token'),
        user:         state.auth.user,
      }));

      processQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      store.dispatch(clearCredentials());
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('luxor:require-login'));
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
