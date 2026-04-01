/* ── ClaimGuard AI — API Client ───────────────────────────────────────────── */

window.API = {
  _handleUnauth(r) {
    if (r.status === 401 && window.Auth) { window.Auth.showLogin(); throw new Error('Session expired'); }
  },
  async _get(path) {
    const r = await fetch(path);
    this._handleUnauth(r);
    const j = await r.json();
    if (!j.success) throw new Error(j.error || 'Request failed');
    return j.data;
  },
  async _post(path, body) {
    const r = await fetch(path, { method: 'POST', body });
    this._handleUnauth(r);
    const j = await r.json();
    if (!j.success) throw new Error(j.error || 'Request failed');
    return j.data;
  },
  async _put(path, data) {
    const r = await fetch(path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    this._handleUnauth(r);
    const j = await r.json();
    if (!j.success) throw new Error(j.error || 'Request failed');
    return j.data;
  },
  async _delete(path) {
    const r = await fetch(path, { method: 'DELETE' });
    this._handleUnauth(r);
    const j = await r.json();
    if (!j.success) throw new Error(j.error || 'Request failed');
    return j.data;
  },

  // Dashboard
  getStats: () => API._get('/api/stats'),
  getActivity: () => API._get('/api/activity'),

  // Claims
  getClaims: () => API._get('/api/claims'),
  getClaim: id => API._get(`/api/claims/${id}`),
  submitClaim: fd => API._post('/api/claims', fd),

  // Queue
  getQueue: () => API._get('/api/queue'),
  reviewClaim: (id, action, reviewerName, notes) =>
    API._put(`/api/claims/${id}/review`, { action, reviewerName, notes }),
  assignClaim: (id, assignedTo) =>
    API._put(`/api/claims/${id}/assign`, { assignedTo }),

  // Reports
  getReports: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return API._get(`/api/reports/claims${q ? '?' + q : ''}`);
  },
  exportUrl: (format, params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return `/api/reports/export/${format}${q ? '?' + q : ''}`;
  },

  // Settings
  getSettings: () => API._get('/api/settings'),
  updateSettings: data => API._put('/api/settings', data),
  addReviewer: (email) => API._post('/api/settings/reviewers', { email }),
  removeReviewer: (email) => API._delete(`/api/settings/reviewers/${encodeURIComponent(email)}`)
};
