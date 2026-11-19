import { create } from 'zustand';

const API_BASE = 'http://localhost:8000';

const getStoredAuth = () => {
  try {
    const token = localStorage.getItem('ag_access_token');
    const refreshToken = localStorage.getItem('ag_refresh_token');
    const userStr = localStorage.getItem('ag_user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, refreshToken, user, isAuthenticated: !!(token && user) };
  } catch (e) {
    return { token: null, refreshToken: null, user: null, isAuthenticated: false };
  }
};

const initial = getStoredAuth();

const useAuthStore = create((set, get) => ({
  user: initial.user,
  token: initial.token,
  refreshToken: initial.refreshToken,
  isAuthenticated: initial.isAuthenticated,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Authentication failed. Please check credentials.');
      }

      const data = await res.json();
      localStorage.setItem('ag_access_token', data.access_token);
      localStorage.setItem('ag_refresh_token', data.refresh_token);
      localStorage.setItem('ag_user', JSON.stringify(data.user));

      set({
        user: data.user,
        token: data.access_token,
        refreshToken: data.refresh_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return data.user;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  register: async (email, password, fullName, role = 'evaluator') => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          role,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Registration failed.');
      }

      const data = await res.json();
      localStorage.setItem('ag_access_token', data.access_token);
      localStorage.setItem('ag_refresh_token', data.refresh_token);
      localStorage.setItem('ag_user', JSON.stringify(data.user));

      set({
        user: data.user,
        token: data.access_token,
        refreshToken: data.refresh_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return data.user;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('ag_access_token');
    localStorage.removeItem('ag_refresh_token');
    localStorage.removeItem('ag_user');
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
    });
  },

  getWsTicket: async (sessionId) => {
    const token = get().token;
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/api/auth/ws-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.ticket;
    } catch (e) {
      console.warn('Failed to obtain WebSocket ticket, falling back to bearer token query:', e);
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
