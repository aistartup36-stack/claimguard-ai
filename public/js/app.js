/* ── ClaimLens AI — App Router & Shared Components ───────────────────────── */

// Short alias — falls back to the raw key if i18n hasn't loaded for any reason.
const T = (k, vars) => (window.i18n ? window.i18n.t(k, vars) : k);

// Audit trail helpers — translate when keys are present, fall back to raw text
// for legacy/seed entries that were stored as plain strings.
const SYSTEM_ACTORS = new Set(['System', 'Claimant', 'Reviewer']);
function _auditAction(action) {
  return action ? T('audit.action.' + action) : '';
}
function _auditActor(actor) {
  if (!actor) return '';
  return SYSTEM_ACTORS.has(actor) ? T('audit.actor.' + actor) : actor;
}
function _auditNotes(notes) {
  if (notes == null) return '';
  if (typeof notes === 'string') return notes;
  if (typeof notes === 'object' && notes.key) {
    // Localise any nested risk-level vars before interpolating
    const vars = { ...(notes.vars || {}) };
    if (vars.level) vars.level = T('risk.' + vars.level);
    return T(notes.key, vars);
  }
  return String(notes);
}

// ── AI image detection card (shared between result + detail views) ─────────
function renderAiImageCheck(check) {
  if (!check || !check.summary) return '';
  const { verdict, maxScore, worstImage } = check.summary;
  if (!verdict || verdict === 'skipped') return '';

  const colours = {
    likely:   { bg: '#FEE2E2', border: '#FECACA', text: '#991B1B', dot: '#EF4444' },
    possible: { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E', dot: '#F59E0B' },
    unlikely: { bg: '#D1FAE5', border: '#A7F3D0', text: '#065F46', dot: '#10B981' },
    error:    { bg: '#F1F5F9', border: '#E2E8F0', text: '#334155', dot: '#94A3B8' }
  };
  const c = colours[verdict] || colours.error;
  const scorePct = maxScore != null ? Math.round(maxScore * 100) : null;

  return `
    <div class="card" style="margin-bottom:22px">
      <div class="card-header"><h3>${T('aiDetect.title')}</h3></div>
      <div class="card-body">
        <div style="display:flex;align-items:flex-start;gap:12px;padding:14px;border-radius:10px;background:${c.bg};border:1px solid ${c.border}">
          <div style="width:10px;height:10px;border-radius:50%;background:${c.dot};margin-top:6px;flex-shrink:0"></div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;color:${c.text};font-size:14px">${T('aiDetect.verdict.' + verdict)}</div>
            ${verdict !== 'error' && scorePct != null ? `<div style="font-size:12px;color:${c.text};opacity:.8;margin-top:2px">${T('aiDetect.score', { n: scorePct })}${worstImage ? ` · ${T('aiDetect.worst', { name: worstImage })}` : ''}</div>` : ''}
            ${verdict !== 'error' && T('aiDetect.explainer.' + verdict) ? `<div style="font-size:13px;color:#334155;margin-top:8px;line-height:1.6">${T('aiDetect.explainer.' + verdict)}</div>` : ''}
          </div>
        </div>
        ${(check.perImage && check.perImage.length > 1) ? `
        <div style="margin-top:14px">
          <div style="font-size:12px;font-weight:600;color:#64748B;margin-bottom:8px">${T('aiDetect.perImage')}</div>
          ${check.perImage.map(img => {
            const v = colours[img.verdict] || colours.error;
            const pct = img.score != null ? Math.round(img.score * 100) : null;
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border:1px solid #E2E8F0;border-radius:8px;margin-bottom:6px;font-size:13px">
              <div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1">
                <div style="width:8px;height:8px;border-radius:50%;background:${v.dot};flex-shrink:0"></div>
                <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${img.name}</span>
              </div>
              <div style="font-weight:600;color:${v.text};flex-shrink:0;margin-left:12px">${img.checked ? pct + '%' : T('aiDetect.verdict.' + img.verdict)}</div>
            </div>`;
          }).join('')}
        </div>` : ''}
      </div>
    </div>`;
}

// ── Cross-claim duplicate match (shared between result + detail views) ─────
function renderCrossClaimMatch(match) {
  if (!match || !match.claimId) return '';
  const when = match.submittedAt ? Utils.fmtDate(match.submittedAt) : '—';
  return `
    <div class="card" style="margin-bottom:22px">
      <div class="card-header"><h3>${T('crossMatch.title')}</h3></div>
      <div class="card-body">
        <div style="display:flex;align-items:flex-start;gap:12px;padding:14px;border-radius:10px;background:#FEE2E2;border:1px solid #FECACA">
          <div style="width:10px;height:10px;border-radius:50%;background:#EF4444;margin-top:6px;flex-shrink:0"></div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;color:#991B1B;font-size:14px">${T('crossMatch.heading')}</div>
            <div style="font-size:13px;color:#334155;margin-top:8px;line-height:1.6">
              ${T('crossMatch.body', { ref: match.policeReport || '—', other: match.claimId, name: match.claimantName || '—', when })}
            </div>
            <div style="margin-top:10px">
              <a href="#" onclick="event.preventDefault(); App.navigate('detail', '${match.claimId}')" style="font-size:13px;font-weight:600;color:#1E5FC4;text-decoration:none">${T('crossMatch.view', { id: match.claimId })} →</a>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Police report attachment (shared between result + detail views) ────────
function renderPoliceReport(claim) {
  if (!claim) return '';
  const file = claim.policeReportFile;
  const ref = (claim.policeReport || '').trim();
  const hasRef = ref && !['n/a', 'na', 'none', 'pending'].includes(ref.toLowerCase());
  if (!file && !hasRef) return ''; // nothing to show

  if (file) {
    return `
      <div class="card" style="margin-bottom:22px">
        <div class="card-header"><h3>${T('policeDoc.title')}</h3></div>
        <div class="card-body">
          <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;background:#D1FAE5;border:1px solid #A7F3D0">
            <div style="font-size:22px">📄</div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:700;color:#065F46;font-size:14px">${T('policeDoc.attached')}</div>
              <div style="font-size:13px;color:#065F46;opacity:.85;margin-top:2px">${file.name}${ref ? ' · ' + T('policeDoc.ref', { ref }) : ''}</div>
            </div>
          </div>
        </div>
      </div>`;
  }
  // Reference but no document
  return `
    <div class="card" style="margin-bottom:22px">
      <div class="card-header"><h3>${T('policeDoc.title')}</h3></div>
      <div class="card-body">
        <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;background:#FEF3C7;border:1px solid #FDE68A">
          <div style="width:10px;height:10px;border-radius:50%;background:#F59E0B;flex-shrink:0"></div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;color:#92400E;font-size:14px">${T('policeDoc.refOnly')}</div>
            <div style="font-size:13px;color:#92400E;opacity:.85;margin-top:2px">${T('policeDoc.refOnlyBody', { ref })}</div>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Badges (shared component) ──────────────────────────────────────────────

window.Badges = {
  risk(level) {
    if (!level) return '—';
    return `<span class="risk-badge ${level}"><span class="risk-dot"></span>${T('risk.' + level)}</span>`;
  },
  status(s) {
    return `<span class="status-badge status-${s}">${T('status.' + s)}</span>`;
  },
  confidence(n) {
    if (n === undefined || n === null) return '';
    const cls = n >= 75 ? 'high-conf' : n >= 50 ? 'med-conf' : 'low-conf';
    return `<span class="confidence-pill ${cls}">${T('badge.confidence', { n })}</span>`;
  }
};

// ── App State & Router ─────────────────────────────────────────────────────

window.App = {
  state: { currentView: 'dashboard', lastResult: null },

  // Page titles/subtitles are now keyed into i18n — see page.* in i18n.js.
  pageConfig: {
    dashboard:   { title: 'page.dashboard.title',   subtitle: 'page.dashboard.subtitle' },
    submit:      { title: 'page.submit.title',      subtitle: 'page.submit.subtitle' },
    invitations: { title: 'page.invitations.title', subtitle: 'page.invitations.subtitle' },
    queue:       { title: 'page.queue.title',       subtitle: 'page.queue.subtitle' },
    history:     { title: 'page.history.title',     subtitle: 'page.history.subtitle' },
    settings:    { title: 'page.settings.title',    subtitle: 'page.settings.subtitle' },
    detail:      { title: 'page.detail.title',      subtitle: 'page.detail.subtitle' },
    result:      { title: 'page.result.title',      subtitle: 'page.result.subtitle' }
  },

  navigate(view, data = null) {
    this.state.currentView = view;

    // Update nav
    document.querySelectorAll('.nav-item').forEach(el =>
      el.classList.toggle('active', el.dataset.view === view));

    // Update header — write i18n keys onto the header elements so the
    // runtime re-applies the right translation when the language changes.
    const cfg = this.pageConfig[view] || this.pageConfig.dashboard;
    const titleEl = document.getElementById('page-title');
    const subEl   = document.getElementById('page-subtitle');
    if (titleEl) { titleEl.setAttribute('data-i18n', cfg.title); titleEl.textContent = T(cfg.title); }
    if (subEl)   { subEl.setAttribute('data-i18n', cfg.subtitle); subEl.textContent = T(cfg.subtitle); }

    // Animate content
    const area = document.getElementById('content-area');
    area.className = 'content-area animate-in';
    void area.offsetWidth;

    switch (view) {
      case 'dashboard':   DashboardView.render(); break;
      case 'submit':      SubmitView.render(); break;
      case 'invitations': InvitationsView.render(); break;
      case 'queue':       QueueView.render(); break;
      case 'history':     HistoryView.render(); break;
      case 'settings':    SettingsView.render(); break;
      case 'result':      this._renderResult(this.state.lastResult); break;
      case 'detail':      this._renderDetail(data || this.state.selectedClaim); break;
      default:            DashboardView.render();
    }
  },

  async viewClaim(id) {
    try {
      const claim = await API.getClaim(id);
      this.state.selectedClaim = claim;
      this.navigate('detail', claim);
    } catch(e) {
      Toast.show(T('detail.toast.failLoad', { msg: e.message }), 'error');
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
        <button class="back-btn" onclick="App.navigate('dashboard')">${Utils.svgIcon('back')} ${T('result.back')}</button>

        ${isEscalated ? `
        <div class="escalation-notice ${claim.riskLevel}">
          <div style="width:22px;height:22px;flex-shrink:0;color:${claim.riskLevel === 'high' ? '#991B1B' : '#92400E'}">${Utils.svgIcon('warn')}</div>
          <div>
            <div class="escalation-title">${claim.riskLevel === 'high' ? T('result.esc.high') : T('result.esc.medium')}</div>
            <div class="escalation-text">${T('result.esc.text')}</div>
          </div>
        </div>` : `
        <div class="escalation-notice low">
          <div style="width:22px;height:22px;flex-shrink:0;color:#065F46">${Utils.svgIcon('check')}</div>
          <div>
            <div class="escalation-title">${T('result.esc.low')}</div>
            <div class="escalation-text">${T('result.esc.lowText')}</div>
          </div>
        </div>`}

        <div style="display:grid;grid-template-columns:260px 1fr;gap:22px;margin-bottom:22px">
          <div class="card">
            <div class="card-body" style="text-align:center">
              <div class="gauge-container">${Utils.scoreGauge(claim.fraudScore || 0, 200)}</div>
              <div style="margin-top:8px">${Badges.risk(claim.riskLevel)}</div>
              <div class="divider"></div>
              <div style="text-align:left;font-size:13px;color:#64748B;display:flex;flex-direction:column;gap:7px">
                <div style="display:flex;justify-content:space-between"><span>${T('result.claimId')}</span><span style="font-weight:600;color:#0A1628;font-family:monospace">${claim.id}</span></div>
                <div style="display:flex;justify-content:space-between"><span>${T('result.type')}</span><span style="font-weight:600;color:#0A1628;text-transform:capitalize">${claim.claimType}</span></div>
                <div style="display:flex;justify-content:space-between"><span>${T('result.claimed')}</span><span style="font-weight:600;color:#0A1628">${Utils.fmt$(claim.claimedAmount)}</span></div>
                ${a.estimated_legitimate_value != null ? `<div style="display:flex;justify-content:space-between"><span>${T('result.estLegit')}</span><span style="font-weight:600;color:#10B981">${Utils.fmt$(a.estimated_legitimate_value)}</span></div>` : ''}
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><h3>${T('result.summary')}</h3></div>
            <div class="card-body">
              <div class="analysis-summary">${a.summary || '—'}</div>
              ${(a.key_concerns?.length || 0) > 0 ? `
              <div style="margin-top:16px">
                <div style="font-size:13px;font-weight:600;color:#334155;margin-bottom:8px">${T('result.keyConcerns')}</div>
                <div class="factors-list">${a.key_concerns.map(c => `<div class="factor-item"><div class="factor-dot neg"></div>${c}</div>`).join('')}</div>
              </div>` : ''}
              ${(a.positive_factors?.length || 0) > 0 ? `
              <div style="margin-top:14px">
                <div style="font-size:13px;font-weight:600;color:#334155;margin-bottom:8px">${T('result.positive')}</div>
                <div class="factors-list">${a.positive_factors.map(f => `<div class="factor-item"><div class="factor-dot pos"></div>${f}</div>`).join('')}</div>
              </div>` : ''}
            </div>
          </div>
        </div>

        ${(a.indicators?.length || 0) > 0 ? `
        <div class="card" style="margin-bottom:22px">
          <div class="card-header"><h3>${T('result.indicators')} <span style="font-weight:400;color:#64748B">${T('result.indicators.found', { n: a.indicators.length })}</span></h3></div>
          <div class="card-body">
            ${a.indicators.map(ind => `
              <div class="indicator-item">
                <div class="indicator-bar ${ind.severity}"></div>
                <div class="indicator-content">
                  <h5>${ind.category}${Badges.confidence(ind.confidence)}</h5>
                  <p>${ind.description}</p>
                  <span class="severity-tag ${ind.severity}">${T('result.severity', { level: T('risk.' + ind.severity) })}</span>
                </div>
              </div>`).join('')}
          </div>
        </div>` : ''}

        ${renderAiImageCheck(claim.aiImageCheck)}
        ${renderCrossClaimMatch(claim.crossClaimMatch)}
        ${renderPoliceReport(claim)}

        <div class="card" style="margin-bottom:22px">
          <div class="card-header"><h3>${T('result.recommendation')}</h3></div>
          <div class="card-body"><p style="font-size:14px;color:#334155;line-height:1.75">${a.recommendation || '—'}</p></div>
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button class="btn btn-secondary" onclick="App.navigate('submit')">${T('result.btn.another')}</button>
          ${isEscalated ? `<button class="btn btn-primary" onclick="App.navigate('queue')">${T('result.btn.queue')}</button>` : ''}
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
        <button class="back-btn" onclick="history.back()">${Utils.svgIcon('back')} ${T('result.back.generic')}</button>

        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px;flex-wrap:wrap;gap:12px">
          <div>
            <div style="font-size:11px;font-weight:600;color:#94A3B8;letter-spacing:.5px;text-transform:uppercase">${claim.id}</div>
            <h2 style="font-size:24px;font-weight:800;color:#0A1628;letter-spacing:-.5px;margin-top:4px">${claim.claimantName}</h2>
            <div style="font-size:13px;color:#64748B;margin-top:3px">${T('detail.submitted', { when: Utils.fmtDateTime(claim.submittedAt) })}</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            ${a ? Badges.risk(claim.riskLevel) : ''}
            ${Badges.status(claim.status)}
          </div>
        </div>

        <!-- Info + Score -->
        <div class="detail-grid" style="margin-bottom:22px">
          <div class="card">
            <div class="card-header"><h3>${T('detail.info.title')}</h3></div>
            <div class="card-body">
              ${[
                [T('detail.info.type'), `<span style="text-transform:capitalize">${claim.claimType}</span>`],
                [T('detail.info.policy'), `<span style="font-family:monospace">${claim.policyNumber}</span>`],
                [T('detail.info.amount'), `<strong style="font-size:15px">${Utils.fmt$(claim.claimedAmount)}</strong>`],
                ...(a.estimated_legitimate_value != null ? [[T('detail.info.estLegit'), `<span style="color:#10B981;font-weight:600">${Utils.fmt$(a.estimated_legitimate_value)}</span>`]] : []),
                [T('detail.info.incidentDate'), Utils.fmtDate(claim.incidentDate)],
                [T('detail.info.reportDate'), Utils.fmtDate(claim.reportDate)],
                [T('detail.info.location'), claim.incidentLocation],
                [T('detail.info.police'), claim.policeReport || T('detail.info.noPolice')],
                [T('detail.info.witnesses'), claim.witnesses || T('detail.info.noWitness')],
                [T('detail.info.prior'), claim.previousClaims || T('detail.info.noPrior')],
                ...(claim.assignedTo ? [[T('detail.info.assigned'), claim.assignedTo]] : []),
                ...((claim.files?.length || 0) > 0 ? [[T('detail.info.docs'), claim.files.map(f => f.name).join(', ')]] : [])
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
              <div class="card-header"><h3>${T('result.recommendation')}</h3></div>
              <div class="card-body"><p style="font-size:13px;color:#334155;line-height:1.7">${a.recommendation || '—'}</p></div>
            </div>` : `<div class="card"><div class="card-body" style="color:#94A3B8">${T('detail.noAnalysis')}</div></div>`}
          </div>
        </div>

        <!-- Descriptions -->
        <div class="detail-grid" style="margin-bottom:22px">
          <div class="card">
            <div class="card-header"><h3>${T('detail.incident')}</h3></div>
            <div class="card-body"><p style="font-size:14px;color:#334155;line-height:1.75">${claim.incidentDescription}</p></div>
          </div>
          <div class="card">
            <div class="card-header"><h3>${T('detail.damage')}</h3></div>
            <div class="card-body"><p style="font-size:14px;color:#334155;line-height:1.75">${claim.damageDescription}</p></div>
          </div>
        </div>

        ${a ? `
        <!-- AI Analysis -->
        <div class="card" style="margin-bottom:22px">
          <div class="card-header"><h3>${T('detail.ai.title')}</h3></div>
          <div class="card-body">
            <div class="analysis-summary" style="margin-bottom:18px">${a.summary || '—'}</div>
            ${(a.key_concerns?.length || a.positive_factors?.length) ? `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:18px">
              ${a.key_concerns?.length ? `<div><div style="font-size:13px;font-weight:600;color:#334155;margin-bottom:8px">${T('result.keyConcerns')}</div><div class="factors-list">${a.key_concerns.map(c => `<div class="factor-item"><div class="factor-dot neg"></div>${c}</div>`).join('')}</div></div>` : ''}
              ${a.positive_factors?.length ? `<div><div style="font-size:13px;font-weight:600;color:#334155;margin-bottom:8px">${T('result.positive')}</div><div class="factors-list">${a.positive_factors.map(f => `<div class="factor-item"><div class="factor-dot pos"></div>${f}</div>`).join('')}</div></div>` : ''}
            </div>` : ''}
            ${(a.indicators?.length || 0) > 0 ? `
            <div style="font-size:13px;font-weight:600;color:#334155;margin-bottom:10px">${T('detail.indicators', { n: a.indicators.length })}</div>
            ${a.indicators.map(ind => `
              <div class="indicator-item">
                <div class="indicator-bar ${ind.severity}"></div>
                <div class="indicator-content">
                  <h5>${ind.category}${Badges.confidence(ind.confidence)}</h5>
                  <p>${ind.description}</p>
                  <span class="severity-tag ${ind.severity}">${T('risk.' + ind.severity)}</span>
                </div>
              </div>`).join('')}` : ''}
          </div>
        </div>` : ''}

        ${renderAiImageCheck(claim.aiImageCheck)}
        ${renderCrossClaimMatch(claim.crossClaimMatch)}
        ${renderPoliceReport(claim)}

        <!-- Audit Trail -->
        ${(claim.auditTrail?.length || 0) > 0 ? `
        <div class="card" style="margin-bottom:22px">
          <div class="card-header"><h3>${T('detail.audit.title')}</h3></div>
          <div class="reviewer-panel">
            ${claim.auditTrail.map(e => {
              const noteText = _auditNotes(e.notes);
              return `
              <div class="audit-entry">
                <div class="audit-dot ${e.action}"></div>
                <div style="flex:1">
                  <div style="font-size:13px;font-weight:600;color:#E2E8F0">${_auditAction(e.action)}</div>
                  <div style="font-size:12px;color:#94A3B8">${_auditActor(e.actor)} · ${Utils.fmtDateTime(e.timestamp)}</div>
                  ${noteText ? `<div style="font-size:12px;color:#CBD5E1;margin-top:3px">${noteText}</div>` : ''}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>` : ''}

        <!-- Reviewer Panel -->
        ${isPending ? `
        <div class="reviewer-panel">
          <h3>${T('detail.review.title')}</h3>
          <p>${T('detail.review.body')}</p>
          <input class="reviewer-input" id="reviewer-name" placeholder="${T('detail.review.name')}">
          <select class="reviewer-select" id="reviewer-assign">
            <option value="">${T('detail.review.assign')}</option>
          </select>
          <textarea class="reviewer-textarea" id="reviewer-notes" placeholder="${T('detail.review.notes')}"></textarea>
          <div class="reviewer-actions">
            <button class="btn btn-success" onclick="App.doReview('approve')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              ${T('detail.review.approve')}
            </button>
            <button class="btn btn-danger" onclick="App.doReview('reject')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ${T('detail.review.reject')}
            </button>
            <button class="btn btn-warning" onclick="App.doReview('request-info')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              ${T('detail.review.info')}
            </button>
          </div>
        </div>` : claim.reviewedAt ? `
        <div class="reviewer-panel">
          <h3>${T('detail.decision.title')}</h3>
          <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:16px;margin-top:8px">
            <div style="font-size:12px;color:#94A3B8">${T('detail.decision.by', { who: claim.reviewedBy, when: Utils.fmtDateTime(claim.reviewedAt) })}</div>
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
      const labels = {
        approve:        T('detail.toast.approved'),
        reject:         T('detail.toast.rejected'),
        'request-info': T('detail.toast.info')
      };
      Toast.show(labels[action], action === 'reject' ? 'error' : 'success');
      this._renderDetail(updated);
      API.getStats().then(s => this.updateQueueBadge(s.pendingReview));
    } catch(e) {
      Toast.show(T('detail.toast.failReview', { msg: e.message }), 'error');
    }
  }
};

// ── Re-render the current view when the language changes ──────────────────
if (window.i18n) {
  window.i18n.onChange(() => {
    try {
      const view = App.state.currentView || 'dashboard';
      // Certain views depend on data in state; navigate() handles the
      // common case cleanly. For detail/result we re-render from cached state.
      if (view === 'detail') App._renderDetail(App.state.selectedClaim);
      else if (view === 'result') App._renderResult(App.state.lastResult);
      else App.navigate(view);
    } catch {}
  });
}

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
