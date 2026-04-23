/* ── Module 7 — Claim Invitations View (broker side) ──────────────────────── */

window.InvitationsView = {
  async render() {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    const area = document.getElementById('content-area');
    area.innerHTML = `<div style="color:#94A3B8;padding:40px;text-align:center">${T('generic.loading')}</div>`;
    try {
      const invs = await this._fetchList();
      this._renderPage(invs);
    } catch (e) {
      area.innerHTML = `<div style="color:#EF4444;padding:20px">${T('generic.error', { msg: e.message })}</div>`;
    }
  },

  async _fetchList() {
    const res = await fetch('/api/invitations');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to load invitations');
    return data.data;
  },

  _renderPage(invs) {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    const pending = invs.filter(i => i.status === 'pending');
    const history = invs.filter(i => i.status !== 'pending');

    document.getElementById('content-area').innerHTML = `
      <div style="max-width:900px">
        <div class="card" style="margin-bottom:22px">
          <div class="card-header"><h3>${T('inv.create.title')}</h3></div>
          <div class="card-body">
            <p style="font-size:13px;color:#64748B;margin-bottom:18px">${T('inv.create.desc')}</p>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">${T('submit.field.name')} <span class="req">*</span></label>
                <input class="form-input" id="inv-name" placeholder="${T('submit.field.namePh')}">
              </div>
              <div class="form-group">
                <label class="form-label">${T('submit.field.policy')} <span class="req">*</span></label>
                <input class="form-input" id="inv-policy" placeholder="${T('submit.field.policyPh')}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">${T('inv.create.type')}</label>
              <select class="form-select" id="inv-type">
                <option value="auto">${T('submit.type.auto')}</option>
                <option value="property">${T('submit.type.property')}</option>
              </select>
            </div>
            <div id="inv-error" style="color:#EF4444;font-size:13px;margin-bottom:10px;display:none"></div>
            <button class="btn btn-primary" onclick="InvitationsView.create()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              ${T('inv.create.button')}
            </button>

            <div id="inv-newly-created" style="margin-top:18px"></div>
          </div>
        </div>

        ${pending.length > 0 ? `
        <div class="card" style="margin-bottom:22px">
          <div class="card-header">
            <h3>${T('inv.pending.title')} <span style="font-weight:400;color:#64748B">(${pending.length})</span></h3>
          </div>
          <table class="data-table">
            <thead><tr>
              <th>${T('inv.table.name')}</th>
              <th>${T('inv.table.policy')}</th>
              <th>${T('inv.table.type')}</th>
              <th>${T('inv.table.sent')}</th>
              <th>${T('inv.table.expires')}</th>
              <th>${T('inv.table.link')}</th>
            </tr></thead>
            <tbody>
              ${pending.map(inv => this._row(inv)).join('')}
            </tbody>
          </table>
        </div>` : ''}

        ${history.length > 0 ? `
        <div class="card">
          <div class="card-header">
            <h3>${T('inv.history.title')} <span style="font-weight:400;color:#64748B">(${history.length})</span></h3>
          </div>
          <table class="data-table">
            <thead><tr>
              <th>${T('inv.table.name')}</th>
              <th>${T('inv.table.policy')}</th>
              <th>${T('inv.table.type')}</th>
              <th>${T('inv.table.sent')}</th>
              <th>${T('inv.table.status')}</th>
              <th>${T('inv.table.claim')}</th>
            </tr></thead>
            <tbody>
              ${history.map(inv => this._historyRow(inv)).join('')}
            </tbody>
          </table>
        </div>` : ''}

        ${invs.length === 0 ? `<div class="empty-state" style="margin-top:30px"><h3>${T('inv.empty.title')}</h3><p>${T('inv.empty.body')}</p></div>` : ''}
      </div>`;
  },

  _row(inv) {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    const url = `${location.origin}/claim/${inv.token}`;
    const created = new Date(inv.createdAt).toLocaleDateString();
    const expires = new Date(inv.expiresAt).toLocaleDateString();
    return `<tr>
      <td style="font-weight:500">${inv.claimantName}</td>
      <td style="font-family:monospace;font-size:12px">${inv.policyNumber}</td>
      <td style="text-transform:capitalize">${inv.claimType}</td>
      <td style="font-size:12px;color:#64748B">${created}</td>
      <td style="font-size:12px;color:#64748B">${expires}</td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="InvitationsView.copyLink('${inv.token}')" title="${url}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          ${T('inv.copy')}
        </button>
      </td>
    </tr>`;
  },

  _historyRow(inv) {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    const created = new Date(inv.createdAt).toLocaleDateString();
    const statusMap = {
      submitted: `<span class="status-badge status-approved">${T('inv.status.submitted')}</span>`,
      expired:   `<span class="status-badge">${T('inv.status.expired')}</span>`
    };
    return `<tr${inv.submittedClaimId ? ` onclick="App.viewClaim('${inv.submittedClaimId}')" style="cursor:pointer"` : ''}>
      <td style="font-weight:500">${inv.claimantName}</td>
      <td style="font-family:monospace;font-size:12px">${inv.policyNumber}</td>
      <td style="text-transform:capitalize">${inv.claimType}</td>
      <td style="font-size:12px;color:#64748B">${created}</td>
      <td>${statusMap[inv.status] || inv.status}</td>
      <td style="font-family:monospace;font-size:12px">${inv.submittedClaimId || '—'}</td>
    </tr>`;
  },

  async create() {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    const name = document.getElementById('inv-name').value.trim();
    const policy = document.getElementById('inv-policy').value.trim();
    const type = document.getElementById('inv-type').value;
    const errEl = document.getElementById('inv-error');
    errEl.style.display = 'none';

    if (!name || !policy) {
      errEl.textContent = T('inv.error.missing');
      errEl.style.display = 'block';
      return;
    }

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimantName: name, policyNumber: policy, claimType: type })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed');

      // Show the newly created link with a copy button
      const url = `${location.origin}/claim/${data.data.token}`;
      document.getElementById('inv-newly-created').innerHTML = `
        <div style="padding:14px;background:#D1FAE5;border:1px solid #A7F3D0;border-radius:10px">
          <div style="font-weight:700;color:#065F46;font-size:13px;margin-bottom:6px">${T('inv.created.title')}</div>
          <div style="font-size:12px;color:#065F46;margin-bottom:10px">${T('inv.created.body', { name })}</div>
          <div style="display:flex;gap:8px;align-items:center;background:white;padding:8px 12px;border-radius:8px;border:1px solid #A7F3D0">
            <input readonly value="${url}" style="flex:1;border:none;font-family:monospace;font-size:12px;color:#0A1628;outline:none" onclick="this.select()">
            <button class="btn btn-sm btn-primary" onclick="InvitationsView.copyFromInput(this)">${T('inv.copy')}</button>
          </div>
        </div>`;

      // Clear form
      document.getElementById('inv-name').value = '';
      document.getElementById('inv-policy').value = '';
      Toast.show(T('inv.toast.created'), 'success');

      // Refresh the rest of the view
      const invs = await this._fetchList();
      // Re-render the tables but keep the newly-created banner visible
      const banner = document.getElementById('inv-newly-created').outerHTML;
      this._renderPage(invs);
      const created = document.getElementById('inv-newly-created');
      if (created) created.outerHTML = banner;
    } catch (e) {
      errEl.textContent = e.message;
      errEl.style.display = 'block';
    }
  },

  copyLink(token) {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    const url = `${location.origin}/claim/${token}`;
    navigator.clipboard.writeText(url).then(
      () => Toast.show(T('inv.toast.copied'), 'success'),
      () => Toast.show(T('inv.toast.copyFail'), 'error')
    );
  },

  copyFromInput(btn) {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    const input = btn.parentElement.querySelector('input');
    input.select();
    navigator.clipboard.writeText(input.value).then(
      () => Toast.show(T('inv.toast.copied'), 'success'),
      () => Toast.show(T('inv.toast.copyFail'), 'error')
    );
  }
};
