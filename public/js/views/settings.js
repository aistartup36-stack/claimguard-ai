/* ── Module 6 — Settings & Configuration View ─────────────────────────────── */

window.SettingsView = {
  _settings: null,

  async render() {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    document.getElementById('content-area').innerHTML = `<div style="color:#94A3B8;padding:40px;text-align:center">${T('generic.loading')}</div>`;
    try {
      this._settings = await API.getSettings();
      this._renderContent();
    } catch(e) {
      document.getElementById('content-area').innerHTML = `<div style="color:#EF4444;padding:20px">${T('generic.error', { msg: e.message })}</div>`;
    }
  },

  _renderContent() {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    const s = this._settings;
    document.getElementById('content-area').innerHTML = `
      <div style="max-width:760px">

        <!-- API Status -->
        <div class="card" style="margin-bottom:24px">
          <div class="card-header"><h3>${T('settings.status.title')}</h3></div>
          <div class="card-body">
            <div class="api-status">
              <div style="width:10px;height:10px;border-radius:50%;background:${s.apiKeyConfigured ? '#10B981' : '#F59E0B'};flex-shrink:0"></div>
              <div>
                <div style="font-weight:600;color:#0A1628">${s.apiKeyConfigured ? T('settings.status.connected') : T('settings.status.demo')}</div>
                <div style="font-size:12px;color:#64748B;margin-top:2px">${s.apiKeyConfigured ? T('settings.status.connectedDesc') : T('settings.status.demoDesc')}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fraud Detection Thresholds -->
        <div class="card" style="margin-bottom:24px">
          <div class="card-header"><h3>${T('settings.thresholds.title')}</h3></div>
          <div class="card-body">
            <p style="font-size:13px;color:#64748B;margin-bottom:20px">
              ${T('settings.thresholds.desc')}
            </p>

            <div style="margin-bottom:22px">
              <label class="form-label">${T('settings.thresholds.low', { n: `<span id="low-val">${s.lowRiskThreshold}</span>` })}</label>
              <div class="threshold-display">
                <input type="range" min="10" max="50" value="${s.lowRiskThreshold}" class="threshold-range" id="low-slider"
                  oninput="document.getElementById('low-val').textContent=this.value">
              </div>
              <div style="font-size:12px;color:#64748B">${T('settings.thresholds.lowDesc', { n: s.lowRiskThreshold })}</div>
            </div>

            <div style="margin-bottom:22px">
              <label class="form-label">${T('settings.thresholds.high', { n: `<span id="high-val">${s.highRiskThreshold}</span>` })}</label>
              <div class="threshold-display">
                <input type="range" min="50" max="90" value="${s.highRiskThreshold}" class="threshold-range" id="high-slider"
                  oninput="document.getElementById('high-val').textContent=this.value">
              </div>
              <div style="font-size:12px;color:#64748B">${T('settings.thresholds.highDesc', { n: s.highRiskThreshold })}</div>
            </div>

            <div style="margin-bottom:22px">
              <label class="form-label">${T('settings.sensitivity')}</label>
              <select class="form-select" id="sensitivity-select">
                <option value="low" ${s.sensitivity==='low'?'selected':''}>${T('settings.sensitivity.low')}</option>
                <option value="medium" ${s.sensitivity==='medium'?'selected':''}>${T('settings.sensitivity.medium')}</option>
                <option value="high" ${s.sensitivity==='high'?'selected':''}>${T('settings.sensitivity.high')}</option>
              </select>
            </div>

            <div style="margin-bottom:20px;display:flex;align-items:center;gap:12px">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
                <input type="checkbox" id="escalation-check" ${s.escalationEnabled ? 'checked' : ''} style="width:16px;height:16px;accent-color:#1E6FD9">
                <span style="font-size:14px;font-weight:500;color:#334155">${T('settings.autoEscalate')}</span>
              </label>
            </div>

            <button class="btn btn-primary" onclick="SettingsView.saveThresholds()">${T('settings.saveThresholds')}</button>
          </div>
        </div>

        <!-- Reviewer Accounts -->
        <div class="card" style="margin-bottom:24px">
          <div class="card-header"><h3>${T('settings.reviewers.title')}</h3><span style="font-size:12px;color:#64748B">${s.reviewers.length === 1 ? T('settings.reviewers.count.one') : T('settings.reviewers.count', { n: s.reviewers.length })}</span></div>
          <div class="card-body">
            <p style="font-size:13px;color:#64748B;margin-bottom:18px">${T('settings.reviewers.desc')}</p>
            <div id="reviewer-list">
              ${s.reviewers.map(r => this._reviewerRow(r)).join('')}
              ${s.reviewers.length === 0 ? `<p style="color:#94A3B8;font-size:13px">${T('settings.reviewers.empty')}</p>` : ''}
            </div>
            <div class="divider"></div>
            <div style="display:flex;gap:10px">
              <input class="form-input" id="new-reviewer-email" placeholder="${T('settings.reviewers.placeholder')}" style="flex:1" onkeydown="if(event.key==='Enter'){SettingsView.addReviewer()}">
              <button class="btn btn-primary" onclick="SettingsView.addReviewer()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                ${T('settings.reviewers.add')}
              </button>
            </div>
          </div>
        </div>

        <!-- About -->
        <div class="card">
          <div class="card-header"><h3>${T('settings.about.title')}</h3></div>
          <div class="card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;color:#64748B">
              <div><strong style="color:#0A1628">${T('settings.about.version')}</strong><br>${T('settings.about.versionVal')}</div>
              <div><strong style="color:#0A1628">${T('settings.about.model')}</strong><br>${T('settings.about.modelVal')}</div>
              <div><strong style="color:#0A1628">${T('settings.about.storage')}</strong><br>${T('settings.about.storageVal')}</div>
              <div><strong style="color:#0A1628">${T('settings.about.modules')}</strong><br>${T('settings.about.modulesVal')}</div>
            </div>
          </div>
        </div>
      </div>`;
  },

  _reviewerRow(email) {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
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
        ${T('settings.reviewers.remove')}
      </button>
    </div>`;
  },

  async saveThresholds() {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    try {
      await API.updateSettings({
        lowRiskThreshold: parseInt(document.getElementById('low-slider').value),
        highRiskThreshold: parseInt(document.getElementById('high-slider').value),
        sensitivity: document.getElementById('sensitivity-select').value,
        escalationEnabled: document.getElementById('escalation-check').checked
      });
      Toast.show(T('settings.toast.saved'), 'success');
      this._settings = await API.getSettings();
    } catch(e) {
      Toast.show(T('settings.toast.saveFail', { msg: e.message }), 'error');
    }
  },

  async addReviewer() {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    const email = document.getElementById('new-reviewer-email').value.trim();
    if (!email || !email.includes('@')) { Toast.show(T('settings.toast.email'), 'error'); return; }
    try {
      this._settings = await API.addReviewer(email);
      document.getElementById('new-reviewer-email').value = '';
      document.getElementById('reviewer-list').innerHTML = this._settings.reviewers.map(r => this._reviewerRow(r)).join('');
      Toast.show(T('settings.toast.added', { email }), 'success');
    } catch(e) {
      Toast.show(T('settings.toast.fail', { msg: e.message }), 'error');
    }
  },

  async removeReviewer(email) {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    try {
      this._settings = await API.removeReviewer(email);
      document.getElementById('reviewer-list').innerHTML =
        this._settings.reviewers.length > 0
          ? this._settings.reviewers.map(r => this._reviewerRow(r)).join('')
          : `<p style="color:#94A3B8;font-size:13px">${T('settings.reviewers.empty')}</p>`;
      Toast.show(T('settings.toast.removed', { email }), 'info');
    } catch(e) {
      Toast.show(T('settings.toast.fail', { msg: e.message }), 'error');
    }
  }
};
