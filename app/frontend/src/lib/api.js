import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('2am_shoppers_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(new Error(err.response?.data?.error ?? err.message))
);

export default api;

// ── Customer ─────────────────────────────────────────────────
export const wishlistApi = {
  list:   ()        => api.get('/wishlist'),
  add:    (data)    => api.post('/wishlist', data),
  update: (id, d)   => api.patch(`/wishlist/${id}`, d),
  remove: (id)      => api.delete(`/wishlist/${id}`),
};

export const conversationApi = {
  start:  (data)    => api.post('/conversations', data),
  reply:  (id, msg) => api.post(`/conversations/${id}/reply`, { message: msg }),
  list:   ()        => api.get('/conversations'),
  close:  (id, r)   => api.post(`/conversations/${id}/close`, { reason: r }),
};

export const remindersApi = {
  list:   ()        => api.get('/reminders'),
  set:    (data)    => api.post('/reminders', data),
  dismiss:(id)      => api.delete(`/reminders/${id}`),
};

// ── Business ──────────────────────────────────────────────────
export const catalogueApi = {
  list:   ()        => api.get('/catalogue'),
  add:    (data)    => api.post('/catalogue', data),
  update: (id, d)   => api.patch(`/catalogue/${id}`, d),
};

export const customersApi = {
  list:   ()        => api.get('/customers'),
  get:    (id)      => api.get(`/customers/${id}`),
  import: (data)    => api.post('/customers/import', data),
};

export const journeysApi = {
  list:   ()        => api.get('/journeys'),
  start:  (data)    => api.post('/journeys', data),
  event:  (id, e)   => api.post(`/journeys/${id}/event`, e),
  close:  (id, out) => api.post(`/journeys/${id}/close`, { outcome: out }),
};

export const dashboardApi = {
  summary: ()       => api.get('/dashboard/summary'),
  segments:()       => api.get('/dashboard/segments'),
};
