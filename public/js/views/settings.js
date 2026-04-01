/* ── Module 6 — Settings & Configuration View ─────────────────────────────── */

window.SettingsView = {
  _settings: null,

  async render() {
    document.getElementById('content-area').innerHTML = `<div style="color:#94A3B8;padding:40px;text-align:center">Loading...</div>`;
    try {
      this._settings = await API.getSettings();
      this._renderContent();
    } catch(e) {
      document.getElementById('content-area').innerHTML = `<div style="color:#EF4444;padding:20px">Error: ${e.message}</div>`;
    }
  },

  _renderContent() {
    const s = this._settings;
    document.getElementById('content-area').innerHTML = `
      <div style="max-width:760px">

        <!-- API Status -->
        <div class="card" style="margin-bottom:24px">
          <div class="card-header"><h3>System Status</h3></div>
          <div class="card-body">
            <div class="api-status">
              <div style="width:10px;height:10px;border-radius:50%;background:${s.apiKeyConfigured ? '#10B981' : '#F59E0B'};flex-shrink:0"></div>
              <div>
                <div style="font-weight:600;color:#0A1628">${s.apiKeyConfigured ? 'Claude AI Connected' : 'Demo Mode — Claude AI Not Connected'}</div>
                <div style="font-size:12px;color:#64748B;margin-top:2px">${s.apiKeyConfigured
                  ? 'ANTHROPIC_API_KEY is configured. Full AI analysis with Claude Opus is active.'
                  : 'Add ANTHROPIC_API_KEY to your .env file to enable full AI-powered fraud analysis.'}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fraud Detection Thresholds -->
        <div class="card" style="margin-bottom:24px">
          <div class="card-header"><h3>Fraud Detection Thresholds</h3></div>
          <div class="card-body">
            <p style="font-size:13px;color:#64748B;margin-bottom:20px">
              Adjust the score boundaries that determine claim risk classification. Claims scoring above the High Threshold are automatically escalated with priority.
            </p>

            <div style="margin-bottom:22px">
              <label class="form-label">Low Risk Threshold (0 – <span id="low-val">${s.lowRiskThreshold}</span>)</label>
              <div class="threshold-display">
                <input type="range" min="10" max="50" value="${s.lowRiskThreshold}" class="threshold-range" id="low-slider"
                  oninput="document.getElementById('low-val').textContent=this.value">
              </div>
              <div style="font-size:12px;color:#64748B">Claims scoring 0–${s.lowRiskThreshold} are classified as <strong style="color:#10B981">Low Risk</strong> and auto-cleared.</div>
            </div>

            <div style="margin-bottom:22px">
              <label class="form-label">High Risk Threshold (<span id="high-val">${s.highRiskThreshold}</span> – 100)</label>
              <div class="threshold-display">
                <input type="range" min="50" max="90" value="${s.highRiskThreshold}" class="threshold-range" id="high-slider"
                  oninput="document.getElementById('high-val').textContent=this.value">
              </div>
              <div style="font-size:12px;color:#64748B">Claims scoring ${s.highRiskThreshold}–100 are classified as <strong style="color:#EF4444">High Risk</strong> (priority review).</div>
            </div>

            <div style="margin-bottom:22px">
              <label class="form-label">Detection Sensitivity</label>
              <select class="form-select" id="sensitivity-select">
                <option value="low" ${s.sensitivity==='low'?'selected':''}>Low — Fewer flags, less noise</option>
                <option value="medium" ${s.sensitivity==='medium'?'selected':''}>Medium — Balanced (recommended)</option>
                <option value="high" ${s.sensitivity==='high'?'selected':''}>High — More flags, broader detection</option>
              </select>
            </div>

            <div style="margin-bottom:20px;display:flex;align-items:center;gap:12px">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
                <input type="checkbox" id="escalation-check" ${s.escalationEnabled ? 'checked' : ''} style="width:16px;height:16px;accent-color:#1E6FD9">
                <span style="font-size:14px;font-weight:500;color:#334155">Auto-escalate medium and high risk claims to review queue</span>
              </label>
            </div>

            <button class="btn btn-primary" onclick="SettingsView.saveThresholds()">Save Threshold Settings</button>
          </div>
        </div>

        <!-- Reviewer Accounts -->
        <div class="card" style="margin-bottom:24px">
          <div class="card-header"><h3>Reviewer Accounts</h3><span style="font-size:12px;color:#64748B">${s.reviewers.length} reviewer${s.reviewers.length !== 1 ? 's' : ''}</span></div>
          <div class="card-body">
            <p style="font-size:13px;color:#64748B;margin-bottom:18px">Reviewers can be assigned to cases in the review queue. Add email addresses below.</p>
            <div id="reviewer-list">
              ${s.reviewers.map(r => this._reviewerRow(r)).join('')}
              ${s.reviewers.length === 0 ? `<p style="color:#94A3B8;font-size:13px">No reviewers added yet.</p>` : ''}
            </div>
            <div class="divider"></div>
            <div style="display:flex;gap:10px">
              <input class="form-input" id="new-reviewer-email" placeholder="reviewer@company.com" style="flex:1" onkeydown="if(event.key==='Enter'){SettingsView.addReviewer()}">
              <button class="btn btn-primary" onclick="SettingsView.addReviewer()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Reviewer
              </button>
            </div>
          </div>
        </div>

        <!-- About -->
        <div class="card">
          <div class="card-header"><h3>About ClaimGuard AI</h3></div>
          <div class="card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;color:#64748B">
              <div><strong style="color:#0A1628">Version</strong><br>2.0.0 — Modular Architecture</div>
              <div><strong style="color:#0A1628">AI Model</strong><br>Claude Opus 4.6 (Anthropic)</div>
              <div><strong style="color:#0A1628">Storage</strong><br>Local JSON (data/claims.json)</div>
              <div><strong style="color:#0A1628">Modules</strong><br>Dashboard · Claims · Analysis · Queue · Reports · Settings</div>
            </div>
          </div>
        </div>
      </div>`;
  },

  _reviewerRow(email) {
    return `<div class="reviewer-row">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:32px;height:32px;border-radius:50%;background:#EFF6FF;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#1E6FD9">
          ${email[0].toUpperCase()}
        </div>
        <div>
          <div style="font-weight:600;color:#0A1628">${email.split('@')[0]}</div>
          <div style="font-size:12px;color:#64748B">${email}</div>
        </div>
      </div>
      <button class="btn btn-sm btn-ghost" onclick="SettingsView.removeReviewer('${email}')" style="color:#EF4444;border-color:#FEE2E2">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        Remove
      </button>
    </div>`;
  },

  async saveThresholds() {
    try {
      await API.updateSettings({
        lowRiskThreshold: parseInt(document.getElementById('low-slider').value),
        highRiskThreshold: parseInt(document.getElementById('high-slider').value),
        sensitivity: document.getElementById('sensitivity-select').value,
        escalationEnabled: document.getElementById('escalation-check').checked
      });
      Toast.show('Settings saved successfully', 'success');
      this._settings = await API.getSettings();
    } catch(e) {
      Toast.show(`Save failed: ${e.message}`, 'error');
    }
  },

  async addReviewer() {
    const email = document.getElementById('new-reviewer-email').value.trim();
    if (!email || !email.includes('@')) { Toast.show('Enter a valid email address', 'error'); return; }
    try {
      this._settings = await API.addReviewer(email);
      document.getElementById('new-reviewer-email').value = '';
      document.getElementById('reviewer-list').innerHTML = this._settings.reviewers.map(r => this._reviewerRow(r)).join('');
      Toast.show(`${email} added as reviewer`, 'success');
    } catch(e) {
      Toast.show(`Failed: ${e.message}`, 'error');
    }
  },

  async removeReviewer(email) {
    try {
      this._settings = await API.removeReviewer(email);
      document.getElementById('reviewer-list').innerHTML =
        this._settings.reviewers.length > 0
          ? this._settings.reviewers.map(r => this._reviewerRow(r)).join('')
          : `<p style="color:#94A3B8;font-size:13px">No reviewers added yet.</p>`;
      Toast.show(`${email} removed`, 'info');
    } catch(e) {
      Toast.show(`Failed: ${e.message}`, 'error');
    }
  }
};
