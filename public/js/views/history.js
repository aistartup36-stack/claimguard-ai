/* ── Module 5 — Claims History & Reporting View ───────────────────────────── */

window.HistoryView = {
  _claims: [],
  _page: 1,
  _perPage: 15,
  _filters: {},

  async render() {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    document.getElementById('content-area').innerHTML = `<div style="color:#94A3B8;padding:40px;text-align:center">${T('generic.loading')}</div>`;
    this._page = 1;
    this._filters = {};
    try {
      this._claims = await API.getReports();
      this._renderPage();
    } catch(e) {
      document.getElementById('content-area').innerHTML = `<div style="color:#EF4444;padding:20px">${T('generic.error', { msg: e.message })}</div>`;
    }
  },

  _renderPage() {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    const filtered = this._applyFilters();
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / this._perPage));
    this._page = Math.min(this._page, pages);
    const slice = filtered.slice((this._page - 1) * this._perPage, this._page * this._perPage);

    document.getElementById('content-area').innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>${T('history.title')} <span style="font-weight:400;color:#64748B">(${total})</span></h3>
          <div style="display:flex;gap:8px">
            <a class="btn btn-sm btn-ghost" href="${API.exportUrl('csv', this._filters)}" download>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              ${T('history.export.csv')}
            </a>
            <a class="btn btn-sm btn-ghost" href="${API.exportUrl('pdf', this._filters)}" target="_blank">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              ${T('history.export.pdf')}
            </a>
          </div>
        </div>

        <!-- Filters -->
        <div style="padding:14px 24px;border-bottom:1px solid #E2E8F0;background:#F8FAFC">
          <div class="filters-bar">
            <input class="search-input" placeholder="${T('history.search')}" value="${this._filters.search || ''}" oninput="HistoryView._setFilter('search', this.value)">
            <select class="filter-select" onchange="HistoryView._setFilter('riskLevel', this.value)">
              <option value="">${T('history.filter.allRisk')}</option>
              <option value="low" ${this._filters.riskLevel==='low'?'selected':''}>${T('risk.low')}</option>
              <option value="medium" ${this._filters.riskLevel==='medium'?'selected':''}>${T('risk.medium')}</option>
              <option value="high" ${this._filters.riskLevel==='high'?'selected':''}>${T('risk.high')}</option>
            </select>
            <select class="filter-select" onchange="HistoryView._setFilter('status', this.value)">
              <option value="">${T('history.filter.allStatus')}</option>
              <option value="approved" ${this._filters.status==='approved'?'selected':''}>${T('status.approved')}</option>
              <option value="rejected" ${this._filters.status==='rejected'?'selected':''}>${T('status.rejected')}</option>
              <option value="pending-review" ${this._filters.status==='pending-review'?'selected':''}>${T('status.pending-review')}</option>
              <option value="low-risk" ${this._filters.status==='low-risk'?'selected':''}>${T('status.low-risk')}</option>
              <option value="info-requested" ${this._filters.status==='info-requested'?'selected':''}>${T('status.info-requested')}</option>
            </select>
            <select class="filter-select" onchange="HistoryView._setFilter('claimType', this.value)">
              <option value="">${T('history.filter.allTypes')}</option>
              <option value="auto" ${this._filters.claimType==='auto'?'selected':''}>${T('history.type.auto')}</option>
              <option value="property" ${this._filters.claimType==='property'?'selected':''}>${T('history.type.property')}</option>
            </select>
            <input class="filter-select" type="date" title="${T('history.date.from')}" value="${this._filters.startDate || ''}" onchange="HistoryView._setFilter('startDate', this.value)" style="width:140px">
            <input class="filter-select" type="date" title="${T('history.date.to')}" value="${this._filters.endDate || ''}" onchange="HistoryView._setFilter('endDate', this.value)" style="width:140px">
            ${Object.values(this._filters).some(v => v) ? `<button class="btn btn-sm btn-ghost" onclick="HistoryView._clearFilters()">${T('history.clear')}</button>` : ''}
          </div>
        </div>

        <!-- Table -->
        ${slice.length === 0
          ? `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg><h3>${T('history.empty.title')}</h3><p>${T('history.empty.body')}</p></div>`
          : `<table class="data-table">
            <thead><tr>
              <th>${T('history.col.id')}</th><th>${T('history.col.claimant')}</th><th>${T('history.col.type')}</th><th>${T('history.col.policy')}</th>
              <th>${T('history.col.amount')}</th><th>${T('history.col.incident')}</th><th>${T('history.col.flags')}</th><th>${T('history.col.risk')}</th><th>${T('history.col.status')}</th><th>${T('history.col.submitted')}</th>
            </tr></thead>
            <tbody>
              ${slice.map(c => `<tr onclick="App.viewClaim('${c.id}')">
                <td style="font-family:monospace;font-weight:600;color:#0A1628;font-size:12px">${c.id}</td>
                <td style="font-weight:500">${c.claimantName}</td>
                <td style="text-transform:capitalize">${c.claimType}</td>
                <td style="font-size:12px;color:#64748B;font-family:monospace">${c.policyNumber}</td>
                <td style="font-weight:600">${Utils.fmt$(c.claimedAmount)}</td>
                <td>${Utils.fmtDate(c.incidentDate)}</td>
                <td style="text-align:center">${c.indicatorCount > 0 ? `<span style="font-weight:700;color:${c.indicatorCount >= 3 ? '#EF4444' : '#F59E0B'}">${c.indicatorCount}</span>` : '<span style="color:#94A3B8">—</span>'}</td>
                <td>${c.riskLevel ? Badges.risk(c.riskLevel) : '<span style="color:#94A3B8">—</span>'}</td>
                <td>${Badges.status(c.status)}</td>
                <td style="font-size:12px;color:#64748B">${Utils.fmtDate(c.submittedAt)}</td>
              </tr>`).join('')}
            </tbody>
          </table>`}

        <!-- Pagination -->
        ${pages > 1 ? `
          <div class="pagination" style="padding:16px">
            ${this._page > 1 ? `<button class="page-btn" onclick="HistoryView._goPage(${this._page-1})">←</button>` : ''}
            ${Array.from({length: pages}, (_,i) => `<button class="page-btn ${i+1===this._page?'active':''}" onclick="HistoryView._goPage(${i+1})">${i+1}</button>`).join('')}
            ${this._page < pages ? `<button class="page-btn" onclick="HistoryView._goPage(${this._page+1})">→</button>` : ''}
          </div>` : ''}
      </div>`;
  },

  _applyFilters() {
    return this._claims.filter(c => {
      if (this._filters.riskLevel && c.riskLevel !== this._filters.riskLevel) return false;
      if (this._filters.status && c.status !== this._filters.status) return false;
      if (this._filters.claimType && c.claimType !== this._filters.claimType) return false;
      if (this._filters.startDate && new Date(c.submittedAt) < new Date(this._filters.startDate)) return false;
      if (this._filters.endDate && new Date(c.submittedAt) > new Date(this._filters.endDate + 'T23:59:59')) return false;
      if (this._filters.search) {
        const q = this._filters.search.toLowerCase();
        return c.claimantName.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.policyNumber.toLowerCase().includes(q);
      }
      return true;
    });
  },

  _setFilter(key, val) { this._filters[key] = val; this._page = 1; this._renderPage(); },
  _clearFilters() { this._filters = {}; this._page = 1; this._renderPage(); },
  _goPage(n) { this._page = n; this._renderPage(); }
};
