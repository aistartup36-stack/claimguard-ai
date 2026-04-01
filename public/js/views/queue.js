/* ── Module 4 — Review Queue View ────────────────────────────────────────── */

window.QueueView = {
  _settings: null,

  async render() {
    const area = document.getElementById('content-area');
    area.innerHTML = `<div style="color:#94A3B8;padding:40px;text-align:center">Loading queue...</div>`;
    try {
      const [queue, settings] = await Promise.all([API.getQueue(), API.getSettings()]);
      this._settings = settings;
      App.updateQueueBadge(queue.length);

      if (queue.length === 0) {
        area.innerHTML = `<div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg>
          <h3>Queue is Clear</h3><p>No claims are currently awaiting human review.</p>
        </div>`;
        return;
      }

      const high = queue.filter(c => c.riskLevel === 'high').length;
      const med  = queue.filter(c => c.riskLevel === 'medium').length;

      area.innerHTML = `
        <div style="max-width:900px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:22px;flex-wrap:wrap">
            <div style="flex:1;font-size:13px;color:#64748B">${queue.length} claim${queue.length !== 1 ? 's' : ''} awaiting review · Sorted by fraud score</div>
            ${high ? Badges.risk('high') + ` <span style="font-size:12px;color:#64748B">${high} High</span>` : ''}
            ${med  ? Badges.risk('medium') + ` <span style="font-size:12px;color:#64748B">${med} Medium</span>` : ''}
          </div>
          ${queue.map(c => this._card(c, settings.reviewers)).join('')}
        </div>`;
    } catch(e) {
      area.innerHTML = `<div style="color:#EF4444;padding:20px">Error: ${e.message}</div>`;
    }
  },

  _card(c, reviewers) {
    const indicators = c.analysis?.indicators || [];
    const topIndicator = indicators.sort((a,b) => (b.confidence||0)-(a.confidence||0))[0];
    return `
      <div class="queue-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div onclick="App.viewClaim('${c.id}')" style="flex:1;cursor:pointer">
            <div style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:.4px">${c.id}</div>
            <div style="font-size:17px;font-weight:700;color:#0A1628;margin-top:3px">${c.claimantName}</div>
            <div style="font-size:12px;color:#64748B;text-transform:capitalize;margin-top:2px">${c.claimType} · ${c.policyNumber}</div>
            ${topIndicator ? `<div style="font-size:12px;color:#64748B;margin-top:8px;display:flex;align-items:center;gap:6px">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
              <span style="font-style:italic">${topIndicator.description.substring(0,90)}${topIndicator.description.length > 90 ? '…' : ''}</span>
            </div>` : ''}
          </div>
          <div style="text-align:right;flex-shrink:0;padding-left:16px">
            <div style="font-size:32px;font-weight:800;letter-spacing:-1px" class="score-${c.riskLevel}">${c.fraudScore}</div>
            <div style="font-size:10px;color:#94A3B8;margin-top:1px">FRAUD SCORE</div>
            <div style="margin-top:6px">${Badges.risk(c.riskLevel)}</div>
          </div>
        </div>
        <div class="queue-card-footer">
          <div class="queue-meta"><div class="queue-meta-label">Claimed</div><div class="queue-meta-value">${Utils.fmt$(c.claimedAmount)}</div></div>
          <div class="queue-meta"><div class="queue-meta-label">Incident</div><div class="queue-meta-value">${Utils.fmtDate(c.incidentDate)}</div></div>
          <div class="queue-meta"><div class="queue-meta-label">Status</div><div class="queue-meta-value">${Badges.status(c.status)}</div></div>
          <div class="queue-meta" style="margin-left:auto">
            <div class="queue-meta-label">Assign to</div>
            <div style="display:flex;gap:6px;align-items:center">
              <select class="filter-select" style="font-size:12px;padding:4px 8px" onchange="QueueView.assign('${c.id}', this.value)">
                <option value="">Unassigned</option>
                ${reviewers.map(r => `<option value="${r}" ${c.assignedTo === r ? 'selected' : ''}>${r.split('@')[0]}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="queue-meta">
            <div class="queue-meta-label">&nbsp;</div>
            <button class="btn btn-primary btn-sm" onclick="App.viewClaim('${c.id}')">Review →</button>
          </div>
        </div>
      </div>`;
  },

  async assign(id, email) {
    try {
      await API.assignClaim(id, email || null);
      Toast.show(email ? `Assigned to ${email.split('@')[0]}` : 'Unassigned', 'success');
    } catch(e) {
      Toast.show(`Assignment failed: ${e.message}`, 'error');
    }
  }
};
