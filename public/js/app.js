/* ── ClaimLens AI — App Router & Shared Components ───────────────────────── */

// ── Badges (shared component) ──────────────────────────────────────────────

window.Badges = {
  risk(level) {
    if (!level) return '—';
    return `<span class="risk-badge ${level}"><span class="risk-dot"></span>${level}</span>`;
  },
  status(s) {
    const labels = { approved: 'Approved', rejected: 'Rejected', 'pending-review': 'Pending Review', analyzing: 'Analysing', 'info-requested': 'Info Requested', 'low-risk': 'Low Risk' };
    return `<span class="status-badge status-${s}">${labels[s] || s}</span>`;
  },
  confidence(n) {
    if (n === undefined || n === null) return '';
    const cls = n >= 75 ? 'high-conf' : n >= 50 ? 'med-conf' : 'low-conf';
    return `<span class="confidence-pill ${cls}">${n}% confidence</span>`;
  }
};

// ── App State & Router ─────────────────────────────────────────────────────

window.App = {
  state: { currentView: 'dashboard', lastResult: null },

  pageConfig: {
    dashboard: { title: 'Dashboard',          subtitle: 'Insurance fraud detection overview' },
    submit:    { title: 'Submit Claim',        subtitle: 'Upload a new claim for AI fraud analysis' },
    queue:     { title: 'Review Queue',        subtitle: 'Claims escalated for human review' },
    history:   { title: 'Claims History',      subtitle: 'Search, filter, and export all processed claims' },
    settings:  { title: 'Settings',            subtitle: 'Configure fraud detection and manage reviewers' },
    detail:    { title: 'Claim Detail',        subtitle: 'Full claim information and AI analysis' },
    result:    { title: 'Analysis Complete',   subtitle: 'AI fraud assessment results' }
  },

  navigate(view, data = null) {
    this.state.currentView = view;

    // Update nav
    document.querySelectorAll('.nav-item').forEach(el =>
      el.classList.toggle('active', el.dataset.view === view));

    // Update header
    const cfg = this.pageConfig[view] || this.pageConfig.dashboard;
    document.getElementById('page-title').textContent = cfg.title;
    document.getElementById('page-subtitle').textContent = cfg.subtitle;

    // Animate content
    const area = document.getElementById('content-area');
    area.className = 'content-area animate-in';
    void area.offsetWidth;

    switch (view) {
      case 'dashboard': DashboardView.render(); break;
      case 'submit':    SubmitView.render(); break;
      case 'queue':     QueueView.render(); break;
      case 'history':   HistoryView.render(); break;
      case 'settings':  SettingsView.render(); break;
      case 'result':    this._renderResult(this.state.lastResult); break;
      case 'detail':    this._renderDetail(data || this.state.selectedClaim); break;
      default:          DashboardView.render();
    }
  },

  async viewClaim(id) {
    try {
      const claim = await API.getClaim(id);
      this.state.selectedClaim = claim;
      this.navigate('detail', claim);
    } catch(e) {
      Toast.show(`Could not load claim: ${e.message}`, 'error');
    }
  },

  updateQueueBadge(count) {
    const badge = document.getElementById('queue-badge');
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  },

  // ── Loading ────────────────────────────────────────────────────────────
  _loadingTimer: null,

  showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
    const steps = ['step-1','step-2','step-3','step-4','step-5'];
    steps.forEach(s => { const el = document.getElementById(s); if (el) el.className = 'loading-step'; });
    let i = 0;
    this._loadingTimer = setInterval(() => {
      if (i > 0) { const prev = document.getElementById(steps[i-1]); if (prev) prev.className = 'loading-step done'; }
      if (i < steps.length) { const el = document.getElementById(steps[i]); if (el) el.className = 'loading-step active'; i++; }
    }, 1500);
  },

  hideLoading() {
    clearInterval(this._loadingTimer);
    document.getElementById('loading-overlay').style.display = 'none';
  },

  // ── Analysis Result View ───────────────────────────────────────────────

  _renderResult(claim) {
    if (!claim) { this.navigate('dashboard'); return; }
    const a = claim.analysis || {};
    const isEscalated = claim.riskLevel === 'medium' || claim.riskLevel === 'high';

    document.getElementById('content-area').innerHTML = `
      <div style="max-width:920px">
        <button class="back-btn" onclick="App.navigate('dashboard')">${Utils.svgIcon('back')} Back to Dashboard</button>

        ${isEscalated ? `
        <div class="escalation-notice ${claim.riskLevel}">
          <div style="width:22px;height:22px;flex-shrink:0;color:${claim.riskLevel === 'high' ? '#991B1B' : '#92400E'}">${Utils.svgIcon('warn')}</div>
          <div>
            <div class="escalation-title">${claim.riskLevel === 'high' ? '🔴 High Risk — Priority Escalation' : '🟡 Medium Risk — Escalated for Review'}</div>
            <div class="escalation-text">This claim has been added to the Human Review Queue. A reviewer will assess the AI findings and take appropriate action.</div>
          </div>
        </div>` : `
        <div class="escalation-notice low">
          <div style="width:22px;height:22px;flex-shrink:0;color:#065F46">${Utils.svgIcon('check')}</div>
          <div>
            <div class="escalation-title">✅ Low Risk — Cleared for Processing</div>
            <div class="escalation-text">AI analysis found no significant fraud indicators. This claim can proceed through standard processing.</div>
          </div>
        </div>`}

        <div style="display:grid;grid-template-columns:260px 1fr;gap:22px;margin-bottom:22px">
          <div class="card">
            <div class="card-body" style="text-align:center">
              <div class="gauge-container">${Utils.scoreGauge(claim.fraudScore || 0, 200)}</div>
              <div style="margin-top:8px">${Badges.risk(claim.riskLevel)}</div>
              <div class="divider"></div>
              <div style="text-align:left;font-size:13px;color:#64748B;display:flex;flex-direction:column;gap:7px">
                <div style="display:flex;justify-content:space-between"><span>Claim ID</span><span style="font-weight:600;color:#0A1628;font-family:monospace">${claim.id}</span></div>
                <div style="display:flex;justify-content:space-between"><span>Type</span><span style="font-weight:600;color:#0A1628;text-transform:capitalize">${claim.claimType}</span></div>
                <div style="display:flex;justify-content:space-between"><span>Claimed</span><span style="font-weight:600;color:#0A1628">${Utils.fmt$(claim.claimedAmount)}</span></div>
                ${a.estimated_legitimate_value != null ? `<div style="display:flex;justify-content:space-between"><span>Est. Legitimate</span><span style="font-weight:600;color:#10B981">${Utils.fmt$(a.estimated_legitimate_value)}</span></div>` : ''}
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><h3>AI Assessment Summary</h3></div>
            <div class="card-body">
              <div class="analysis-summary">${a.summary || '—'}</div>
              ${(a.key_concerns?.length || 0) > 0 ? `
              <div style="margin-top:16px">
                <div style="font-size:13px;font-weight:600;color:#334155;margin-bottom:8px">Key Concerns</div>
                <div class="factors-list">${a.key_concerns.map(c => `<div class="factor-item"><div class="factor-dot neg"></div>${c}</div>`).join('')}</div>
              </div>` : ''}
              ${(a.positive_factors?.length || 0) > 0 ? `
              <div style="margin-top:14px">
                <div style="font-size:13px;font-weight:600;color:#334155;margin-bottom:8px">Positive Factors</div>
                <div class="factors-list">${a.positive_factors.map(f => `<div class="factor-item"><div class="factor-dot pos"></div>${f}</div>`).join('')}</div>
              </div>` : ''}
            </div>
          </div>
        </div>

        ${(a.indicators?.length || 0) > 0 ? `
        <div class="card" style="margin-bottom:22px">
          <div class="card-header"><h3>Fraud Indicators <span style="font-weight:400;color:#64748B">(${a.indicators.length} found)</span></h3></div>
          <div class="card-body">
            ${a.indicators.map(ind => `
              <div class="indicator-item">
                <div class="indicator-bar ${ind.severity}"></div>
                <div class="indicator-content">
                  <h5>${ind.category}${Badges.confidence(ind.confidence)}</h5>
                  <p>${ind.description}</p>
                  <span class="severity-tag ${ind.severity}">${ind.severity} severity</span>
                </div>
              </div>`).join('')}
          </div>
        </div>` : ''}

        <div class="card" style="margin-bottom:22px">
          <div class="card-header"><h3>Recommendation</h3></div>
          <div class="card-body"><p style="font-size:14px;color:#334155;line-height:1.75">${a.recommendation || '—'}</p></div>
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button class="btn btn-secondary" onclick="App.navigate('submit')">Submit Another Claim</button>
          ${isEscalated ? `<button class="btn btn-primary" onclick="App.navigate('queue')">Go to Review Queue →</button>` : ''}
        </div>
      </div>`;
  },

  // ── Claim Detail View ──────────────────────────────────────────────────

  _renderDetail(claim) {
    if (!claim) { this.navigate('history'); return; }
    const a = claim.analysis || {};
    const isPending = claim.status === 'pending-review' || claim.status === 'info-requested';

    document.getElementById('content-area').innerHTML = `
      <div style="max-width:1020px">
        <button class="back-btn" onclick="history.back()">${Utils.svgIcon('back')} Back</button>

        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px;flex-wrap:wrap;gap:12px">
          <div>
            <div style="font-size:11px;font-weight:600;color:#94A3B8;letter-spacing:.5px;text-transform:uppercase">${claim.id}</div>
            <h2 style="font-size:24px;font-weight:800;color:#0A1628;letter-spacing:-.5px;margin-top:4px">${claim.claimantName}</h2>
            <div style="font-size:13px;color:#64748B;margin-top:3px">Submitted ${Utils.fmtDateTime(claim.submittedAt)}</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            ${a ? Badges.risk(claim.riskLevel) : ''}
            ${Badges.status(claim.status)}
          </div>
        </div>

        <!-- Info + Score -->
        <div class="detail-grid" style="margin-bottom:22px">
          <div class="card">
            <div class="card-header"><h3>Claim Information</h3></div>
            <div class="card-body">
              ${[
                ['Type', `<span style="text-transform:capitalize">${claim.claimType}</span>`],
                ['Policy Number', `<span style="font-family:monospace">${claim.policyNumber}</span>`],
                ['Claimed Amount', `<strong style="font-size:15px">${Utils.fmt$(claim.claimedAmount)}</strong>`],
                ...(a.estimated_legitimate_value != null ? [['Est. Legitimate', `<span style="color:#10B981;font-weight:600">${Utils.fmt$(a.estimated_legitimate_value)}</span>`]] : []),
                ['Incident Date', Utils.fmtDate(claim.incidentDate)],
                ['Report Date', Utils.fmtDate(claim.reportDate)],
                ['Location', claim.incidentLocation],
                ['Police Report', claim.policeReport || 'None filed'],
                ['Witnesses', claim.witnesses || 'None'],
                ['Prior Claims', claim.previousClaims || 'None declared'],
                ...(claim.assignedTo ? [['Assigned To', claim.assignedTo]] : []),
                ...((claim.files?.length || 0) > 0 ? [['Documents', claim.files.map(f => f.name).join(', ')]] : [])
              ].map(([k,v]) => `<div class="info-item"><span class="info-key">${k}</span><span class="info-val">${v}</span></div>`).join('')}
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:18px">
            ${a ? `
            <div class="card">
              <div class="card-body" style="text-align:center">
                ${Utils.scoreGauge(claim.fraudScore || 0, 170)}
                <div style="margin-top:8px">${Badges.risk(claim.riskLevel)}</div>
              </div>
            </div>
            <div class="card">
              <div class="card-header"><h3>Recommendation</h3></div>
              <div class="card-body"><p style="font-size:13px;color:#334155;line-height:1.7">${a.recommendation || '—'}</p></div>
            </div>` : '<div class="card"><div class="card-body" style="color:#94A3B8">No analysis available</div></div>'}
          </div>
        </div>

        <!-- Descriptions -->
        <div class="detail-grid" style="margin-bottom:22px">
          <div class="card">
            <div class="card-header"><h3>Incident Description</h3></div>
            <div class="card-body"><p style="font-size:14px;color:#334155;line-height:1.75">${claim.incidentDescription}</p></div>
          </div>
          <div class="card">
            <div class="card-header"><h3>Damage Description</h3></div>
            <div class="card-body"><p style="font-size:14px;color:#334155;line-height:1.75">${claim.damageDescription}</p></div>
          </div>
        </div>

        ${a ? `
        <!-- AI Analysis -->
        <div class="card" style="margin-bottom:22px">
          <div class="card-header"><h3>AI Fraud Analysis</h3></div>
          <div class="card-body">
            <div class="analysis-summary" style="margin-bottom:18px">${a.summary || '—'}</div>
            ${(a.key_concerns?.length || a.positive_factors?.length) ? `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:18px">
              ${a.key_concerns?.length ? `<div><div style="font-size:13px;font-weight:600;color:#334155;margin-bottom:8px">Key Concerns</div><div class="factors-list">${a.key_concerns.map(c => `<div class="factor-item"><div class="factor-dot neg"></div>${c}</div>`).join('')}</div></div>` : ''}
              ${a.positive_factors?.length ? `<div><div style="font-size:13px;font-weight:600;color:#334155;margin-bottom:8px">Positive Factors</div><div class="factors-list">${a.positive_factors.map(f => `<div class="factor-item"><div class="factor-dot pos"></div>${f}</div>`).join('')}</div></div>` : ''}
            </div>` : ''}
            ${(a.indicators?.length || 0) > 0 ? `
            <div style="font-size:13px;font-weight:600;color:#334155;margin-bottom:10px">Fraud Indicators (${a.indicators.length})</div>
            ${a.indicators.map(ind => `
              <div class="indicator-item">
                <div class="indicator-bar ${ind.severity}"></div>
                <div class="indicator-content">
                  <h5>${ind.category}${Badges.confidence(ind.confidence)}</h5>
                  <p>${ind.description}</p>
                  <span class="severity-tag ${ind.severity}">${ind.severity}</span>
                </div>
              </div>`).join('')}` : ''}
          </div>
        </div>` : ''}

        <!-- Audit Trail -->
        ${(claim.auditTrail?.length || 0) > 0 ? `
        <div class="card" style="margin-bottom:22px">
          <div class="card-header"><h3>Audit Trail</h3></div>
          <div class="reviewer-panel">
            ${claim.auditTrail.map(e => `
              <div class="audit-entry">
                <div class="audit-dot ${e.action}"></div>
                <div style="flex:1">
                  <div style="font-size:13px;font-weight:600;color:#E2E8F0;text-transform:capitalize">${e.action}</div>
                  <div style="font-size:12px;color:#94A3B8">${e.actor} · ${Utils.fmtDateTime(e.timestamp)}</div>
                  ${e.notes ? `<div style="font-size:12px;color:#CBD5E1;margin-top:3px">${e.notes}</div>` : ''}
                </div>
              </div>`).join('')}
          </div>
        </div>` : ''}

        <!-- Reviewer Panel -->
        ${isPending ? `
        <div class="reviewer-panel">
          <h3>Human Review Decision</h3>
          <p>Review the AI analysis above and make your determination. All decisions are logged in the audit trail.</p>
          <input class="reviewer-input" id="reviewer-name" placeholder="Your name">
          <select class="reviewer-select" id="reviewer-assign">
            <option value="">Assign to reviewer (optional)</option>
          </select>
          <textarea class="reviewer-textarea" id="reviewer-notes" placeholder="Add review notes, reasoning, or instructions for the claimant…"></textarea>
          <div class="reviewer-actions">
            <button class="btn btn-success" onclick="App.doReview('approve')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Approve Claim
            </button>
            <button class="btn btn-danger" onclick="App.doReview('reject')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Reject (Fraud)
            </button>
            <button class="btn btn-warning" onclick="App.doReview('request-info')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Request Info
            </button>
          </div>
        </div>` : claim.reviewedAt ? `
        <div class="reviewer-panel">
          <h3>Review Decision</h3>
          <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:16px;margin-top:8px">
            <div style="font-size:12px;color:#94A3B8">Reviewed by ${claim.reviewedBy} on ${Utils.fmtDateTime(claim.reviewedAt)}</div>
            <div style="margin-top:8px">${Badges.status(claim.status)}</div>
            ${claim.reviewNotes ? `<div style="font-size:14px;color:#E2E8F0;margin-top:10px">${claim.reviewNotes}</div>` : ''}
          </div>
        </div>` : ''}
      </div>`;

    // Load reviewers for assign dropdown
    if (isPending) {
      API.getSettings().then(s => {
        const sel = document.getElementById('reviewer-assign');
        if (sel) s.reviewers.forEach(r => {
          const opt = document.createElement('option');
          opt.value = r; opt.textContent = r;
          if (claim.assignedTo === r) opt.selected = true;
          sel.appendChild(opt);
        });
      });
    }
  },

  async doReview(action) {
    const claim = this.state.selectedClaim;
    if (!claim) return;
    const reviewerName = document.getElementById('reviewer-name')?.value.trim() || 'Reviewer';
    const notes = document.getElementById('reviewer-notes')?.value.trim() || '';
    const assignTo = document.getElementById('reviewer-assign')?.value;

    try {
      if (assignTo && assignTo !== claim.assignedTo) await API.assignClaim(claim.id, assignTo);
      const updated = await API.reviewClaim(claim.id, action, reviewerName, notes);
      this.state.selectedClaim = updated;
      const labels = { approve: 'Claim approved ✓', reject: 'Claim rejected — fraud confirmed', 'request-info': 'More information requested' };
      Toast.show(labels[action], action === 'reject' ? 'error' : 'success');
      this._renderDetail(updated);
      API.getStats().then(s => this.updateQueueBadge(s.pendingReview));
    } catch(e) {
      Toast.show(`Review failed: ${e.message}`, 'error');
    }
  }
};

// ── Expose globals ─────────────────────────────────────────────────────────

window.navigate = (v, d) => App.navigate(v, d);
window.viewClaim = id => App.viewClaim(id);

// ── Init ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  // Wait for auth check to complete before making any API calls
  const authenticated = await Auth.ready;
  if (!authenticated) return;
  Auth._populateSidebar();
  try {
    const stats = await API.getStats();
    App.updateQueueBadge(stats.pendingReview);
  } catch {}
  App.navigate('dashboard');
});
