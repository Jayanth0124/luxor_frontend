import { createSlice } from '@reduxjs/toolkit';

const load = () => {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null, user: null };
  try {
    return {
      accessToken:  localStorage.getItem('luxor_token') ?? null,
      refreshToken: localStorage.getItem('luxor_refresh_token') ?? null,
      user:         JSON.parse(localStorage.getItem('luxor_user') ?? 'null'),
    };
  } catch { return { accessToken: null, refreshToken: null, user: null }; }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: load(),
  reducers: {
    setCredentials(state, { payload: { accessToken, refreshToken, user } }) {
      state.accessToken  = accessToken;
      state.refreshToken = refreshToken;
      state.user         = user ?? null;
      if (typeof window !== 'undefined') {
        localStorage.setItem('luxor_token', accessToken);
        if (refreshToken) localStorage.setItem('luxor_refresh_token', refreshToken);
        if (user)         localStorage.setItem('luxor_user', JSON.stringify(user));
      }
    },
    updateUser(state, { payload }) {
      state.user = { ...state.user, ...payload };
      if (typeof window !== 'undefined') {
        localStorage.setItem('luxor_user', JSON.stringify(state.user));
      }
    },
    clearCredentials(state) {
      state.accessToken  = null;
      state.refreshToken = null;
      state.user         = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('luxor_token');
        localStorage.removeItem('luxor_refresh_token');
        localStorage.removeItem('luxor_user');
      }
    },
  },
});

export const { setCredentials, updateUser, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectIsAuthenticated = (s) => !!s.auth.accessToken;
export const selectUser            = (s) => s.auth.user;
export const selectAccessToken     = (s) => s.auth.accessToken;
